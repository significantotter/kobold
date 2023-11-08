import { ExpressionBuilder, Kysely } from 'kysely';
import { Model } from './model.js';
import {
	Database,
	Initiative,
	InitiativeUpdate,
	InitiativeId,
	NewInitiative,
	InitiativeWithRelations,
	InitiativeActor,
	InitiativeActorGroup,
} from '../schemas/index.js';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres';

type InitiativeGraphQueryOutput = Initiative & {
	currentTurnGroup: InitiativeActorGroup | null;
	actors: InitiativeActor[];
	actorGroups: InitiativeActorGroup[];
};

export function actorsForInitiative(eb: ExpressionBuilder<Database, 'initiative'>) {
	return jsonArrayFrom(
		eb
			.selectFrom('initiativeActor')
			.selectAll('initiativeActor')
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
		return buildRelationFromQuery(result)[0];
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
		return buildRelationFromQuery(result);
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
		return buildRelationFromQuery(result)[0] ?? null;
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
			.execute();
		return buildRelationFromQuery(result)[0];
	}

	public async delete({ id }: { id: InitiativeId }): Promise<void> {
		await this.db.deleteFrom('initiative').where('initiative.id', '=', id).execute();
	}
}
