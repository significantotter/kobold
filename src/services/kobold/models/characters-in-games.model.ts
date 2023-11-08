import { Kysely } from 'kysely';
import { Model } from './model.js';
import {
	Database,
	CharactersInGames,
	CharactersInGamesUpdate,
	NewCharactersInGames,
} from '../schemas/index.js';

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
			.execute();
		return result[0];
	}

	public async delete({
		characterId,
		gameId,
	}: {
		characterId: number;
		gameId: number;
	}): Promise<void> {
		await this.db
			.deleteFrom('charactersInGames')
			.where('charactersInGames.characterId', '=', characterId)
			.where('charactersInGames.gameId', '=', gameId)
			.execute();
	}
}
