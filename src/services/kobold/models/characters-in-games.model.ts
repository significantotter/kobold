import { Kysely } from 'kysely';
import {
	CharactersInGames,
	CharactersInGamesUpdate,
	Database,
	NewCharactersInGames,
} from '../schemas/index.js';
import { Model } from './model.js';

export class CharactersInGamesModel extends Model<Database['charactersInGames']> {
	constructor(db: Kysely<Database>) {
		super(db);
	}

	public async create(args: NewCharactersInGames): Promise<CharactersInGames> {
		const result = await this.db
			.insertInto('charactersInGames')
			.values(args)
			.returningAll()
			.execute();
		return result[0];
	}

	public async read({
		characterId,
		gameId,
	}: {
		characterId: number;
		gameId: number;
	}): Promise<CharactersInGames | null> {
		let query = this.db.selectFrom('charactersInGames').selectAll();
		if (characterId != null) {
			query = query.where('charactersInGames.characterId', '=', characterId);
		}
		if (gameId != null) {
			query = query.where('charactersInGames.gameId', '=', gameId);
		}
		const result = await query.execute();
		return result[0] ?? null;
	}

	public async update(
		{
			characterId,
			gameId,
		}: {
			characterId: number;
			gameId: number;
		},
		args: CharactersInGamesUpdate
	): Promise<CharactersInGames> {
		const result = await this.db
			.updateTable('charactersInGames')
			.set(args)
			.where('charactersInGames.characterId', '=', characterId)
			.where('charactersInGames.gameId', '=', gameId)
			.returningAll()
			.executeTakeFirstOrThrow();
		return result;
	}

	public async delete({
		characterId,
		gameId,
	}: {
		characterId: number;
		gameId: number;
	}): Promise<void> {
		const result = await this.db
			.deleteFrom('charactersInGames')
			.where('charactersInGames.characterId', '=', characterId)
			.where('charactersInGames.gameId', '=', gameId)
			.execute();
		if (Number(result[0].numDeletedRows) == 0) throw new Error('No rows deleted');
	}
}
