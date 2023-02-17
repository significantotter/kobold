import { Game } from '../services/kobold/models/index.js';

export class GameUtils {
	public static async getActiveGame(userId, guildId) {
		const games = await Game.query().withGraphFetched('characters').where({
			gmUserId: userId,
			guildId,
			isActive: true,
		});
		if (!games.length) return null;
		else return games[0];
	}
}
