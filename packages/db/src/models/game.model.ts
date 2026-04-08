import { ExpressionBuilder, Kysely, OperandExpression, SqlBool } from 'kysely';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import {
	actionsForCharacter,
	channelDefaultCharacterForCharacter,
	guildDefaultCharacterForCharacter,
	modifiersForCharacter,
	rollMacrosForCharacter,
	sheetRecordForCharacter,
} from '../lib/shared-relation-builders.js';
import {
	Database,
	GameId,
	GameUpdate,
	GameWithCharactersLite,
	GameWithRelations,
	NewGame,
} from '../schemas/index.js';
import { Model } from './model.js';

export function charactersForGame(
	eb: ExpressionBuilder<Database, 'game'>,
	{ guildId, userId }: { guildId?: string; userId?: string } = {}
) {
	return jsonArrayFrom(
		eb
			.selectFrom('character')
			.selectAll('character')
			.select(ebCharacter => [
				channelDefaultCharacterForCharacter(ebCharacter, { userId }),
				guildDefaultCharacterForCharacter(ebCharacter, { guildId, userId }),
				sheetRecordForCharacter(ebCharacter),
				actionsForCharacter(ebCharacter),
				modifiersForCharacter(ebCharacter),
				rollMacrosForCharacter(ebCharacter),
			])
			.whereRef('character.gameId', '=', 'game.id')
	).as('characters');
}

/**
 * Lightweight variant — selects only identity/status columns per character,
 * plus channelDefaultCharacters and guildDefaultCharacters.
 * Drops sheetRecord, actions, modifiers, and rollMacros (~80 % size reduction).
 */
export function charactersForGameLite(
	eb: ExpressionBuilder<Database, 'game'>,
	{ guildId, userId }: { guildId?: string; userId?: string } = {}
) {
	return jsonArrayFrom(
		eb
			.selectFrom('character')
			.select([
				'character.id',
				'character.name',
				'character.userId',
				'character.sheetRecordId',
				'character.isActiveCharacter',
				'character.charId',
				'character.importSource',
				'character.gameId',
			])
			.select(ebCharacter => [
				channelDefaultCharacterForCharacter(ebCharacter, { userId }),
				guildDefaultCharacterForCharacter(ebCharacter, { guildId, userId }),
			])
			.whereRef('character.gameId', '=', 'game.id')
	).as('characters');
}

export class GameModel extends Model<Database['game']> {
	constructor(db: Kysely<Database>) {
		super(db);
	}

	public async create(args: NewGame): Promise<GameWithRelations> {
		const result = await this.db
			.insertInto('game')
			.values(args)
			.returningAll()
			.returning(eb => [charactersForGame(eb)])
			.execute();
		return result[0] as unknown as GameWithRelations;
	}

	/**
	 * Note: GuildId and GmUserId are Or'd Together, everything else is And'd as usual
	 */
	public async readMany({
		guildId,
		userId,
		gmUserId,
		name,
	}: {
		guildId?: string;
		userId?: string;
		gmUserId?: string;
		name?: string;
	}): Promise<GameWithRelations[]> {
		let query = this.db
			.selectFrom('game')
			.selectAll('game')
			.select(eb => [charactersForGame(eb, { guildId, userId })])
			.where(({ eb, or, and }) => {
				const ors: OperandExpression<SqlBool>[] = [];
				const ands: OperandExpression<SqlBool>[] = [];
				if (gmUserId !== undefined) {
					ors.push(eb(`gmUserId`, '=', gmUserId));
				}
				if (name !== undefined) {
					ands.push(eb(`name`, 'ilike', name));
				}
				if (guildId !== undefined) {
					ands.push(eb(`guildId`, '=', guildId));
				}
				if (ors.length) {
					ands.push(or(ors));
				}
				return and(ands);
			});

		return (await query.execute()) as unknown as GameWithRelations[];
	}

	/**
	 * Lightweight readMany — same filters as readMany but characters only include
	 * identity/status columns plus channel/guild defaults. No sheetRecord,
	 * actions, modifiers, or rollMacros are loaded.
	 */
	public async readManyLite({
		guildId,
		userId,
		gmUserId,
		name,
	}: {
		guildId?: string;
		userId?: string;
		gmUserId?: string;
		name?: string;
	}): Promise<GameWithCharactersLite[]> {
		let query = this.db
			.selectFrom('game')
			.selectAll('game')
			.select(eb => [charactersForGameLite(eb, { guildId, userId })])
			.where(({ eb, or, and }) => {
				const ors: OperandExpression<SqlBool>[] = [];
				const ands: OperandExpression<SqlBool>[] = [];
				if (gmUserId !== undefined) {
					ors.push(eb(`gmUserId`, '=', gmUserId));
				}
				if (name !== undefined) {
					ands.push(eb(`name`, 'ilike', name));
				}
				if (guildId !== undefined) {
					ands.push(eb(`guildId`, '=', guildId));
				}
				if (ors.length) {
					ands.push(or(ors));
				}
				return and(ands);
			});

		return (await query.execute()) as unknown as GameWithCharactersLite[];
	}

	public async read({ id }: { id: GameId }): Promise<GameWithRelations | null> {
		const game = await this.db
			.selectFrom('game')
			.selectAll()
			.select(eb => [charactersForGame(eb)])
			.where('game.id', '=', id)
			.execute();

		if (!game.length) return null;
		else return game[0] as unknown as GameWithRelations;
	}

	public async update({ id }: { id: GameId }, args: GameUpdate): Promise<GameWithRelations> {
		const result = await this.db
			.updateTable('game')
			.set(args)
			.where('game.id', '=', id)
			.returningAll()
			.returning(eb => [charactersForGame(eb)])
			.executeTakeFirstOrThrow();
		return result as unknown as GameWithRelations;
	}

	public async updateMany(
		{
			guildId,
			gmUserId,
			name,
		}: {
			guildId?: string;
			gmUserId?: string;
			name?: string;
		},
		args: GameUpdate
	): Promise<GameWithRelations[]> {
		let query = this.db.updateTable('game').set(args);
		if (guildId !== undefined) {
			query = query.where('guildId', '=', guildId);
		}
		if (gmUserId !== undefined) {
			query = query.where('gmUserId', '=', gmUserId);
		}
		if (name !== undefined) {
			query = query.where('name', 'ilike', name);
		}
		const result = await query
			.returningAll()
			.returning(eb => [charactersForGame(eb, { guildId })])
			.execute();
		return result as unknown as GameWithRelations[];
	}

	public async delete({ id }: { id: GameId }): Promise<void> {
		const result = await this.db.deleteFrom('game').where('game.id', '=', id).execute();
		if (Number(result[0].numDeletedRows) == 0) throw new Error('No rows deleted');
	}
}
