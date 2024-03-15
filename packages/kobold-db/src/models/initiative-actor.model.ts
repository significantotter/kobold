import { ExpressionBuilder, Kysely } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/postgres';
import {
	channelDefaultCharacterForCharacter,
	guildDefaultCharacterForCharacter,
} from '../lib/shared-relation-builders.js';
import {
	Database,
	Game,
	Initiative,
	InitiativeActorGroup,
	InitiativeActorId,
	InitiativeActorUpdate,
	InitiativeActorWithRelations,
	NewInitiativeActor,
	SheetRecord,
} from '../schemas/index.js';
import { Model } from './model.js';

export function actorGroupForActor(eb: ExpressionBuilder<Database, 'initiativeActor'>) {
	return jsonObjectFrom(
		eb
			.selectFrom('initiativeActorGroup')
			.selectAll('initiativeActorGroup')
			.whereRef('initiativeActor.initiativeActorGroupId', '=', 'initiativeActorGroup.id')
	)
		.$castTo<InitiativeActorGroup>()
		.as('actorGroup');
}

export function initiativeForActor(eb: ExpressionBuilder<Database, 'initiativeActor'>) {
	return jsonObjectFrom(
		eb
			.selectFrom('initiative')
			.selectAll('initiative')
			.whereRef('initiativeActor.initiativeId', '=', 'initiative.id')
	)
		.$castTo<Initiative>()
		.as('initiative');
}

export function characterForActor(eb: ExpressionBuilder<Database, 'initiativeActor'>) {
	return jsonObjectFrom(
		eb
			.selectFrom('character')
			.selectAll('character')
			.select(ebCharacter => [
				channelDefaultCharacterForCharacter(ebCharacter, {}),
				guildDefaultCharacterForCharacter(ebCharacter, {}),
			])
			.whereRef('initiativeActor.characterId', '=', 'character.id')
	).as('character');
}

function sheetRecordForActor(eb: ExpressionBuilder<Database, 'initiativeActor'>) {
	return jsonObjectFrom(
		eb
			.selectFrom('sheetRecord')
			.selectAll('sheetRecord')
			.whereRef('sheetRecord.id', '=', 'initiativeActor.sheetRecordId')
	)
		.$castTo<SheetRecord>()
		.as('sheetRecord');
}

function GameForActor(eb: ExpressionBuilder<Database, 'initiativeActor'>) {
	return jsonObjectFrom(
		eb.selectFrom('game').selectAll('game').whereRef('game.id', '=', 'initiativeActor.gameId')
	)
		.$castTo<Game>()
		.as('game');
}

export class InitiativeActorModel extends Model<Database['initiativeActor']> {
	constructor(db: Kysely<Database>) {
		super(db);
	}

	public async create(args: NewInitiativeActor): Promise<InitiativeActorWithRelations> {
		const result = await this.db
			.insertInto('initiativeActor')
			.values(args)
			.returningAll()
			.returning(eb => [
				actorGroupForActor(eb),
				initiativeForActor(eb),
				characterForActor(eb),
				sheetRecordForActor(eb),
				GameForActor(eb),
			])
			.execute();
		return result[0];
	}

	public async read({
		id,
	}: {
		id: InitiativeActorId;
	}): Promise<InitiativeActorWithRelations | null> {
		const result = await this.db
			.selectFrom('initiativeActor')
			.selectAll()
			.select(eb => [
				actorGroupForActor(eb),
				initiativeForActor(eb),
				characterForActor(eb),
				sheetRecordForActor(eb),
				GameForActor(eb),
			])
			.where('initiativeActor.id', '=', id)
			.execute();
		return result[0] ?? null;
	}

	public async update(
		{ id, characterId }: { id?: InitiativeActorId; characterId?: number },
		args: InitiativeActorUpdate
	): Promise<InitiativeActorWithRelations> {
		if (!id && !characterId) throw new Error('Must provide either id or characterId');
		let query = this.db
			.updateTable('initiativeActor')
			.set(args)
			.returningAll()
			.returning(eb => [
				actorGroupForActor(eb),
				initiativeForActor(eb),
				characterForActor(eb),
				sheetRecordForActor(eb),
				GameForActor(eb),
			]);
		if (id !== undefined) query = query.where('initiativeActor.id', '=', id);
		if (characterId !== undefined)
			query = query.where('initiativeActor.characterId', '=', characterId);
		const result = await query.executeTakeFirstOrThrow();
		return result;
	}

	public async delete({ id }: { id: InitiativeActorId }): Promise<void> {
		const result = await this.db
			.deleteFrom('initiativeActor')
			.where('initiativeActor.id', '=', id)
			.execute();
		if (Number(result[0].numDeletedRows) == 0) throw new Error('No rows deleted');
	}
}
