import { ExpressionBuilder, Kysely } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres';
import {
	actionsForActor,
	modifiersForActor,
	rollMacrosForActor,
	sheetRecordCachedForActor,
	sheetRecordForActor,
} from '../lib/shared-relation-builders.js';
import {
	Action,
	Database,
	Initiative,
	InitiativeActor,
	InitiativeActorGroup,
	InitiativeId,
	InitiativeUpdate,
	InitiativeWithRelations,
	Modifier,
	NewInitiative,
	RollMacro,
	SheetRecord,
} from '../schemas/index.js';
import { Model } from './model.js';

type InitiativeGraphQueryOutput = Initiative & {
	currentTurnGroup: InitiativeActorGroup | null;
	actors: (InitiativeActor & {
		sheetRecord: SheetRecord;
		actions: Action[];
		modifiers: Modifier[];
		rollMacros: RollMacro[];
	})[];
	actorGroups: InitiativeActorGroup[];
};

export function actorsForInitiative(eb: ExpressionBuilder<Database, 'initiative'>) {
	return jsonArrayFrom(
		eb
			.selectFrom('initiativeActor')
			.selectAll('initiativeActor')
			.select(eb => [
				sheetRecordForActor(eb),
				actionsForActor(eb),
				modifiersForActor(eb),
				rollMacrosForActor(eb),
			])
			.whereRef('initiative.id', '=', 'initiativeActor.initiativeId')
	).as('actors');
}

/**
 * Lite variant of actorsForInitiative — fetches actors with COALESCE'd
 * adjusted sheet (no raw sheet or adjusted_sheet), plus modifiers for note
 * display. Suitable for display/turn management paths.
 */
export function actorsLiteForInitiative(eb: ExpressionBuilder<Database, 'initiative'>) {
	return jsonArrayFrom(
		eb
			.selectFrom('initiativeActor')
			.selectAll('initiativeActor')
			.select(eb => [sheetRecordCachedForActor(eb), modifiersForActor(eb)])
			.whereRef('initiative.id', '=', 'initiativeActor.initiativeId')
	).as('actors');
}

export function actorGroupsForInitiative(eb: ExpressionBuilder<Database, 'initiative'>) {
	return jsonArrayFrom(
		eb
			.selectFrom('initiativeActorGroup')
			.selectAll('initiativeActorGroup')
			.whereRef('initiative.id', '=', 'initiativeActorGroup.initiativeId')
	).as('actorGroups');
}

export function currentTurnGroupForInitiative(eb: ExpressionBuilder<Database, 'initiative'>) {
	return jsonObjectFrom(
		eb
			.selectFrom('initiativeActorGroup')
			.selectAll('initiativeActorGroup')
			.whereRef('initiative.currentTurnGroupId', '=', 'initiativeActorGroup.id')
	).as('currentTurnGroup');
}

/**
 * Takes the output of the query and builds the relations between the objects.
 */
function buildRelationFromQuery(
	initiatives: InitiativeGraphQueryOutput[]
): InitiativeWithRelations[] {
	const initWithActors = initiatives.map(initiative => ({
		...initiative,
		actors: initiative.actors.map(actor => ({
			...actor,
			sheetRecord: actor.sheetRecord!,
			actorGroup: initiative.actorGroups.find(
				group => group.id === actor.initiativeActorGroupId
			)!,
			initiative: initiative,
		})),
	}));
	// do this in 2 steps. We want to make sure all actors are mapped before mapping the groups
	return initWithActors.map(initiative => ({
		...initiative,
		actorGroups: initiative.actorGroups.map(group => ({
			...group,
			actors: initiative.actors.filter(actor => actor.initiativeActorGroupId === group.id),
			initiative: initiative,
		})),
	}));
}

/**
 * The model for the initiative table.
 */
export class InitiativeModel extends Model<Database['initiative']> {
	constructor(db: Kysely<Database>) {
		super(db);
	}

	/**
	 * Creates a new initiative.
	 */
	public async create(args: NewInitiative): Promise<InitiativeWithRelations> {
		const result = await this.db
			.insertInto('initiative')
			.values(args)
			.returningAll()
			.returning(eb => [
				currentTurnGroupForInitiative(eb),
				actorsForInitiative(eb),
				actorGroupsForInitiative(eb),
			])
			.execute();
		return buildRelationFromQuery(result as unknown as InitiativeGraphQueryOutput[])[0];
	}

	/**
	 * Reads all initiatives for a channel.
	 */
	public async readMany({
		channelId,
	}: {
		channelId: string;
	}): Promise<InitiativeWithRelations[]> {
		const result = await this.db
			.selectFrom('initiative')
			.selectAll()
			.select(eb => [
				currentTurnGroupForInitiative(eb),
				actorsForInitiative(eb),
				actorGroupsForInitiative(eb),
			])
			.where('initiative.channelId', '=', channelId)
			.execute();
		return buildRelationFromQuery(result as unknown as InitiativeGraphQueryOutput[]);
	}

	/**
	 * Lite variant — skips actions and rollMacros for each actor.
	 * Use for display, turn management, and other paths that don't need
	 * full mechanical data.
	 */
	public async readManyLite({
		channelId,
	}: {
		channelId: string;
	}): Promise<InitiativeWithRelations[]> {
		const result = await this.db
			.selectFrom('initiative')
			.selectAll()
			.select(eb => [
				currentTurnGroupForInitiative(eb),
				actorsLiteForInitiative(eb),
				actorGroupsForInitiative(eb),
			])
			.where('initiative.channelId', '=', channelId)
			.execute();
		return buildRelationFromQuery(result as unknown as InitiativeGraphQueryOutput[]);
	}

	public async read({ id }: { id: InitiativeId }): Promise<InitiativeWithRelations | null> {
		const result = await this.db
			.selectFrom('initiative')
			.selectAll()
			.select(eb => [
				currentTurnGroupForInitiative(eb),
				actorsForInitiative(eb),
				actorGroupsForInitiative(eb),
			])
			.where('initiative.id', '=', id)
			.execute();
		return buildRelationFromQuery(result as unknown as InitiativeGraphQueryOutput[])[0] ?? null;
	}

	public async update(
		{ id }: { id: InitiativeId },
		args: InitiativeUpdate
	): Promise<InitiativeWithRelations> {
		const result = await this.db
			.updateTable('initiative')
			.set(args)
			.where('initiative.id', '=', id)
			.returningAll()
			.returning(eb => [
				currentTurnGroupForInitiative(eb),
				actorsForInitiative(eb),
				actorGroupsForInitiative(eb),
			])
			.executeTakeFirstOrThrow();
		return buildRelationFromQuery([result] as unknown as InitiativeGraphQueryOutput[])[0];
	}

	public async delete({ id }: { id: InitiativeId }): Promise<void> {
		const result = await this.db
			.deleteFrom('initiative')
			.where('initiative.id', '=', id)
			.execute();
		if (Number(result[0].numDeletedRows) == 0) throw new Error('No rows deleted');
	}
}
