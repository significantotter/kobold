import { ExpressionBuilder, Kysely } from 'kysely';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { Model } from './model.js';
import { Database, GameUpdate, GameId, NewGame, GameWithRelations } from '../schemas/index.js';
import {
	channelDefaultCharacterForCharacter,
	guildDefaultCharacterForCharacter,
	sheetRecordForCharacter,
} from '../lib/shared-relation-builders.js';

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
			])
			.innerJoin('charactersInGames', 'character.id', 'charactersInGames.characterId')
			.whereRef('charactersInGames.gameId', '=', 'game.id')
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
		return result[0];
	}

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
			.where(({ eb, or }) => {
				const ebs = [];
				if (guildId != null) {
					ebs.push(eb(`guildId`, '=', guildId));
				}
				if (gmUserId != null) {
					ebs.push(eb(`gmUserId`, '=', gmUserId));
				}
				if (name != null) {
					ebs.push(eb(`name`, 'ilike', name));
				}
				return or(ebs);
			});

		return await query.execute();
	}

	public async read({ id }: { id: GameId }): Promise<GameWithRelations | null> {
		const game = await this.db
			.selectFrom('game')
			.selectAll()
			.select(eb => [charactersForGame(eb)])
			.where('game.id', '=', id)
			.execute();

		if (!game.length) return null;
		else return game[0];
	}

	public async update({ id }: { id: GameId }, args: GameUpdate): Promise<GameWithRelations> {
		const result = await this.db
			.updateTable('game')
			.set(args)
			.where('game.id', '=', id)
			.returningAll()
			.returning(eb => [charactersForGame(eb)])
			.execute();
		return result[0];
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
		const result = await this.db
			.updateTable('game')
			.set(args)
			.where(({ eb, or }) => {
				const ebs = [];
				if (guildId != null) {
					ebs.push(eb(`guildId`, '=', guildId));
				}
				if (gmUserId != null) {
					ebs.push(eb(`gmUserId`, '=', gmUserId));
				}
				if (name != null) {
					ebs.push(eb(`name`, 'ilike', name));
				}
				return or(ebs);
			})
			.returningAll()
			.returning(eb => [charactersForGame(eb, { guildId })])
			.execute();
		return result;
	}

	public async delete({ id }: { id: GameId }): Promise<void> {
		await this.db.deleteFrom('game').where('game.id', '=', id).execute();
	}
}
