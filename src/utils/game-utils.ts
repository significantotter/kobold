import { AutocompleteInteraction, CacheType, ChatInputCommandInteraction } from 'discord.js';
import {
	Character,
	Game,
	Initiative,
	InitiativeActor,
	ModelWithSheet,
} from '../services/kobold/models/index.js';
import { CharacterUtils } from './character-utils.js';
import { InitiativeUtils } from './initiative-utils.js';

export class GameUtils {
	public static async getActiveGame(userId: string, guildId: string, channelId?: string) {
		const games = await Game.query()
			.withGraphFetched('characters.[guildDefaultCharacter, channelDefaultCharacter]')
			.where({
				guildId,
			});
		const activeGmGame = games.find(game => game.gmUserId === userId && game.isActive);
		if (activeGmGame) return activeGmGame;
		const defaultChannelPlayerGame = games.find(
			game =>
				game.isActive &&
				game.characters.find(
					character =>
						character.userId === userId &&
						character.channelDefaultCharacter.find(
							defaultChar => (defaultChar as any).channelId === channelId
						)
				)
		);
		if (defaultChannelPlayerGame) return defaultChannelPlayerGame;
		const defaultGuildPlayerGame = games.find(
			game =>
				game.isActive &&
				game.characters.find(
					character =>
						character.userId === userId &&
						character.guildDefaultCharacter.find(
							defaultChar => (defaultChar as any).guildId === guildId
						)
				)
		);
		if (defaultGuildPlayerGame) return defaultGuildPlayerGame;
		const activeCharacterGame = games.find(
			game =>
				game.isActive &&
				game.characters.find(
					character => character.userId === userId && character.isActiveCharacter
				)
		);
		if (activeCharacterGame) return activeCharacterGame;
		return null;
	}

	public static async autocompleteGameCharacter(targetCharacterName, activeGame) {
		if (!activeGame.characters) return [];

		const matches: Character[] = [];
		for (const character of activeGame.characters) {
			if (
				targetCharacterName === '' ||
				character.name.toLowerCase().includes(targetCharacterName.toLowerCase())
			) {
				matches.push(character);
			}
		}
		return matches.map(character => ({
			name: character.name,
			value: character.name,
		}));
	}

	public static async getCharacterOrInitActorTarget(
		intr: ChatInputCommandInteraction<CacheType> | AutocompleteInteraction<CacheType>,
		targetName: string
	): Promise<{
		joinedGames: Game[];
		init?: Initiative;
		characterOrInitActorTargets: ModelWithSheet[];
		activeCharacter: Character;
		targetCharacter?: Character;
		targetInitActor?: InitiativeActor;
	}> {
		const [joinedGames, initResult, activeCharacter] = await Promise.all([
			Game.queryWhereUserHasCharacter(intr.user.id, intr.guildId),
			InitiativeUtils.getInitiativeForChannel(intr.channel),
			CharacterUtils.getActiveCharacter(intr),
		]);

		if (!targetName)
			return {
				joinedGames,
				init: initResult.init,
				characterOrInitActorTargets: activeCharacter ? [activeCharacter] : [],
				activeCharacter,
				targetCharacter: activeCharacter,
				targetInitActor: undefined,
			};

		let characterOptions = joinedGames.flatMap(game => game.characters);

		if (activeCharacter) characterOptions = characterOptions.concat(activeCharacter);

		// find a match from the game characters or active character
		let matchedCharacter = characterOptions.find(
			character => character.name.trim().toLowerCase() === targetName.trim().toLowerCase()
		);

		// find a match in the init actors
		let matchedInitActor: InitiativeActor;
		if (!initResult.errorMessage) {
			matchedInitActor = initResult.init.actors.find(
				actor => actor.name.trim().toLowerCase() === targetName.trim().toLowerCase()
			);
		}

		// if we found an init actor but not a character, and the init actor has a character associated with it
		// add in that character
		if (matchedInitActor && !matchedCharacter && matchedInitActor.character) {
			matchedCharacter = matchedInitActor.character;
		}

		const targets: ModelWithSheet[] = [];
		if (matchedCharacter) targets.push(matchedCharacter);
		if (matchedInitActor) targets.push(matchedInitActor);

		return {
			joinedGames,
			init: initResult.init,
			characterOrInitActorTargets: targets,
			activeCharacter,
			targetCharacter: matchedCharacter,
			targetInitActor: matchedInitActor,
		};
	}
}
