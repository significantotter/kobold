import { BaseInteraction, CacheType } from 'discord.js';
import L from '../../i18n/i18n-node.js';
import {
	Character,
	CharacterWithRelations,
	GameWithRelations,
	Kobold,
	SheetRecord,
} from '../../services/kobold/index.js';
import { KoboldError } from '../KoboldError.js';
import type { KoboldUtils } from './kobold-utils.js';
import _ from 'lodash';

export class GameUtils {
	kobold: Kobold;
	constructor(private koboldUtils: KoboldUtils) {
		this.kobold = koboldUtils.kobold;
	}
	public async getActiveGame(userId: string, guildId: string, channelId?: string) {
		const games = await this.kobold.game.readMany({ guildId: guildId });
		const activeGmGame = games.find(game => game.gmUserId === userId && game.isActive);
		if (activeGmGame) return activeGmGame;
		const defaultChannelPlayerGame = games.find(
			game =>
				game.isActive &&
				game.characters.find(
					character =>
						character.userId === userId &&
						(character.channelDefaultCharacters ?? []).find(
							defaultChar => defaultChar.channelId === channelId
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
						(character.guildDefaultCharacters ?? []).find(
							defaultChar => defaultChar.guildId === guildId
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

	public async autocompleteGameCharacter(
		targetCharacterName: String,
		activeGame?: GameWithRelations | null
	) {
		if (!activeGame?.characters) return [];

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

	public async getAllTargetableOptions(intr: BaseInteraction<CacheType>) {
		let [currentInit, targetGames, ownedCharacters] = await Promise.all([
			this.koboldUtils.initiativeUtils.getInitiativeForChannelOrNull(intr.channel),
			this.koboldUtils.gameUtils.getWhereUserHasCharacter(intr.user.id, intr.guildId),
			this.koboldUtils.kobold.character.readMany({ userId: intr.user.id }),
		]);

		let channelDefaultCharacter: CharacterWithRelations | undefined = undefined;
		let guildDefaultCharacter: CharacterWithRelations | undefined = undefined;
		let currentActiveCharacter: CharacterWithRelations | undefined = undefined;
		for (const character of ownedCharacters) {
			if (intr.channelId && character.channelDefaultCharacters.length) {
				channelDefaultCharacter = character.channelDefaultCharacters.find(
					c => c.channelId === intr.channelId
				)
					? character
					: undefined;
			}
			if (intr.guildId && character.guildDefaultCharacters.length) {
				guildDefaultCharacter = character.guildDefaultCharacters.find(
					c => c.guildId === intr.guildId
				)
					? character
					: undefined;
			}
			if (character.isActiveCharacter) {
				currentActiveCharacter = character;
			}
		}
		const activeCharacter =
			channelDefaultCharacter ?? guildDefaultCharacter ?? currentActiveCharacter;

		// only take the games that we're GM'ing in, or that our active character is in
		targetGames = targetGames.filter(
			game =>
				game.gmUserId === intr.user.id ||
				game.characters.find(c => c.id === activeCharacter?.id)
		);

		// the character options can be any game character or the user's active character
		let characterOptions = targetGames
			.flatMap(game => game.characters)
			// flat map can give us undefined values, so filter them out
			.filter(result => !!result);
		if (activeCharacter) {
			characterOptions = characterOptions.concat(ownedCharacters);
		}
		const actorOptions = currentInit?.actors ?? [];

		//return the matched actors, removing any duplicates
		return {
			characterOptions,
			actorOptions,
		};
	}

	public async getCharacterOrInitActorTarget(
		intr: BaseInteraction<CacheType>,
		targetName: string
	): Promise<{
		targetSheetRecord: SheetRecord;
		hideStats: boolean;
		targetName: string;
	}> {
		const { characterOptions, actorOptions } = await this.getAllTargetableOptions(intr);

		// find a match from the game characters or active character
		let matchedCharacter = characterOptions.find(
			character => character.name.trim().toLowerCase() === targetName.trim().toLowerCase()
		);

		// find a match in the init actors
		let matchedInitActor = actorOptions.find(
			actor => actor.name.trim().toLowerCase() === targetName.trim().toLowerCase()
		);

		const targetSheetRecord =
			matchedInitActor?.sheetRecord ?? matchedCharacter?.sheetRecord ?? null;
		const hideStats = matchedInitActor?.hideStats ?? false;
		const actualTargetName = matchedInitActor?.name ?? matchedCharacter?.name;

		if (!targetSheetRecord) {
			throw new KoboldError(
				L.en.commands.roll.interactions.targetNotFound({
					targetName,
				})
			);
		}
		return { targetSheetRecord, hideStats, targetName: actualTargetName! };
	}

	public async getWhereUserHasCharacter(userId: string, guildId: string | null) {
		if (guildId == null) return [];
		const options = await this.kobold.game.readMany({ guildId });

		return options.filter(
			option =>
				option.characters.filter(char => char.userId === userId).length > 0 ||
				option.gmUserId === userId
		);
	}
	public async getWhereUserLacksCharacter(userId: string, guildId: string | null) {
		if (guildId == null) return [];
		const options = await this.kobold.game.readMany({ guildId });
		// Filter out the games that the user is already in
		return options.filter(
			option =>
				option.characters.filter(char => char.userId === userId && char.isActiveCharacter)
					.length === 0
		);
	}
}
