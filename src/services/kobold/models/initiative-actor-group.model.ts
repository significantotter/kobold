import { ExpressionBuilder, Kysely } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres';
import { sheetRecordForActor } from '../lib/shared-relation-builders.js';
import {
	Database,
	Initiative,
	InitiativeActor,
	InitiativeActorGroup,
	InitiativeActorGroupId,
	InitiativeActorGroupUpdate,
	InitiativeActorGroupWithRelations,
	NewInitiativeActorGroup,
	SheetRecord,
} from '../schemas/index.js';
import { Model } from './model.js';

type InitiativeActorGroupGraphQueryOutput = InitiativeActorGroup & {
	actors: (InitiativeActor & { sheetRecord: SheetRecord })[];
	initiative: Initiative;
};

export function actorsForGroup(eb: ExpressionBuilder<Database, 'initiativeActorGroup'>) {
	return jsonArrayFrom(
		eb
			.selectFrom('initiativeActor')
			.selectAll('initiativeActor')
			.select(eb => [sheetRecordForActor(eb)])
			.whereRef('initiativeActorGroup.id', '=', 'initiativeActor.initiativeId')
	).as('actors');
}

export function initiativeForActorGroup(eb: ExpressionBuilder<Database, 'initiativeActorGroup'>) {
	return jsonObjectFrom(
		eb
			.selectFrom('initiative')
			.selectAll('initiative')
			.whereRef('initiativeActorGroup.initiativeId', '=', 'initiative.id')
	)
		.$castTo<Initiative>()
		.as('initiative');
}

function transformQueryOutputToRelations(
	initiativeActorGroups: InitiativeActorGroupGraphQueryOutput[]
): InitiativeActorGroupWithRelations[] {
	return initiativeActorGroups.map(initiativeActorGroup => ({
		...initiativeActorGroup,
		actors: initiativeActorGroup.actors.map(actor => ({
			...actor,
			actorGroup: initiativeActorGroup,
		})),
	}));
}

export class InitiativeActorGroupModel extends Model<Database['initiativeActorGroup']> {
	constructor(db: Kysely<Database>) {
		super(db);
	}

	public async create(args: NewInitiativeActorGroup): Promise<InitiativeActorGroupWithRelations> {
		const result = await this.db
			.insertInto('initiativeActorGroup')
			.values(args)
			.returningAll()
			.returning(eb => [actorsForGroup(eb), initiativeForActorGroup(eb)])
			.execute();
		return transformQueryOutputToRelations(result)[0];
	}

	public async read({
		id,
	}: {
		id: InitiativeActorGroupId;
	}): Promise<InitiativeActorGroupWithRelations | null> {
		const result = await this.db
			.selectFrom('initiativeActorGroup')
			.selectAll()
			.select(eb => [actorsForGroup(eb), initiativeForActorGroup(eb)])
			.where('initiativeActorGroup.id', '=', id)
			.execute();
		return transformQueryOutputToRelations(result)[0] ?? null;
	}

	public async update(
		{ id }: { id: InitiativeActorGroupId },
		args: InitiativeActorGroupUpdate
	): Promise<InitiativeActorGroupWithRelations> {
		const result = await this.db
			.updateTable('initiativeActorGroup')
			.set(args)
			.where('initiativeActorGroup.id', '=', id)
			.returningAll()
			.returning(eb => [actorsForGroup(eb), initiativeForActorGroup(eb)])
			.execute();
		return transformQueryOutputToRelations(result)[0];
	}

	public async delete({ id }: { id: InitiativeActorGroupId }): Promise<void> {
		await this.db
			.deleteFrom('initiativeActorGroup')
			.where('initiativeActorGroup.id', '=', id)
			.execute();
	}
}
