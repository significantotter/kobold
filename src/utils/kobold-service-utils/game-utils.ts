import { AutocompleteInteraction, CacheType, ChatInputCommandInteraction } from 'discord.js';
import L from '../../i18n/i18n-node.js';
import {
	Character,
	CharacterWithRelations,
	GameWithRelations,
	InitiativeActorWithRelations,
	Kobold,
	SheetRecord,
} from '../../services/kobold/index.js';
import { KoboldError } from '../KoboldError.js';
import type { KoboldUtils } from './kobold-utils.js';

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

	public async getCharacterOrInitActorTarget(
		intr: ChatInputCommandInteraction<CacheType> | AutocompleteInteraction<CacheType>,
		targetName: string
	): Promise<{
		targetSheetRecord: SheetRecord;
		hideStats: boolean;
		targetName: string;
	}> {
		const [joinedGames, initResult, activeCharacter] = await Promise.all([
			this.kobold.game.readMany({
				userId: intr.user.id,
				guildId: intr.guildId ?? undefined,
			}),
			this.koboldUtils.initiativeUtils.getInitiativeForChannelOrNull(intr.channel),
			this.koboldUtils.characterUtils.getActiveCharacter(intr),
		]);

		let characterOptions: CharacterWithRelations[] = joinedGames.flatMap(
			game => game.characters
		);

		if (activeCharacter) characterOptions = characterOptions.concat(activeCharacter);

		// find a match from the game characters or active character
		let matchedCharacter = characterOptions.find(
			character => character.name.trim().toLowerCase() === targetName.trim().toLowerCase()
		);

		// find a match in the init actors
		let matchedInitActor: InitiativeActorWithRelations | null;

		matchedInitActor =
			(initResult?.actors ?? []).find(
				actor => actor.name.trim().toLowerCase() === targetName.trim().toLowerCase()
			) ?? null;

		const targetSheetRecord =
			matchedInitActor?.sheetRecord ?? matchedCharacter?.sheetRecord ?? null;
		const hideStats = matchedInitActor?.hideStats ?? false;
		const actualTargetName = matchedInitActor?.name ?? matchedCharacter?.name ?? null;

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
