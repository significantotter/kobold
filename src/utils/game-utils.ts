import { Character, Game } from '../services/kobold/models/index.js';

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

	public static async autocompleteGameCharacter(targetCharacterName, activeGame) {
		if (!activeGame.characters) return [];

		const matches: Character[] = [];
		for (const character of activeGame.characters) {
			if (
				targetCharacterName === '' ||
				character.characterData.name
					.toLowerCase()
					.includes(targetCharacterName.toLowerCase())
			) {
				matches.push(character);
			}
		}
		return matches.map(character => ({
			name: character.characterData.name,
			value: character.characterData.name,
		}));
	}
}
