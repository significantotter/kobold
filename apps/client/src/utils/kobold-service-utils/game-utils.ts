import { BaseInteraction, CacheType } from 'discord.js';
import { utilStrings } from '@kobold/documentation';
import {
	Character,
	CharacterWithRelations,
	GameWithRelations,
	InitiativeActorWithRelations,
	Kobold,
	MinionWithRelations,
	SheetRecord,
} from '@kobold/db';
import { KoboldError } from '../KoboldError.js';
import type { KoboldUtils } from './kobold-utils.js';
import _ from 'lodash';
import { EntityWithSheetData } from '../creature.js';

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
		targetCharacterName: string,
		activeGame?: GameWithRelations | null
	): Promise<{ name: string; value: string }[]> {
		if (!activeGame?.characters)
			return [
				{
					name: 'All Players',
					value: 'All Players',
				},
			];

		const result: { name: string; value: string }[] = [];

		// Add matching characters
		for (const character of activeGame.characters) {
			if (
				targetCharacterName === '' ||
				character.name.toLowerCase().includes(targetCharacterName.toLowerCase())
			) {
				result.push({
					name: character.name,
					value: character.name,
				});
			}
		}

		// Fetch minions for all characters in the game
		const characterIds = activeGame.characters.map(c => c.id);
		if (characterIds.length > 0) {
			const minions = await this.kobold.minion.readManyByCharacterIds({ characterIds });

			// Add matching minions
			for (const minion of minions) {
				const parentCharacter = activeGame.characters.find(
					c => c.id === minion.characterId
				);
				const displayName = parentCharacter
					? `${minion.name} (${parentCharacter.name}'s minion)`
					: minion.name;

				if (
					targetCharacterName === '' ||
					minion.name.toLowerCase().includes(targetCharacterName.toLowerCase()) ||
					displayName.toLowerCase().includes(targetCharacterName.toLowerCase())
				) {
					result.push({
						name: displayName,
						value: `minion:${minion.id}`,
					});
				}
			}
		}

		result.unshift({ name: 'All Players', value: 'All Players' });
		return result;
	}

	/**
	 * Resolves the target selection from autocompleteGameCharacter to actual entities.
	 * Returns characters and their minions for "All Players", a single minion for "minion:id",
	 * or a single character matched by name.
	 */
	public async getGameTargets(
		targetValue: string,
		activeGame: GameWithRelations
	): Promise<{
		characters: CharacterWithRelations[];
		minions: MinionWithRelations[];
	}> {
		// Handle "All Players" - return all characters and their minions
		if (targetValue === 'All Players') {
			const characterIds = activeGame.characters.map(c => c.id);
			const minions =
				characterIds.length > 0
					? await this.kobold.minion.readManyByCharacterIds({ characterIds })
					: [];
			return {
				characters: activeGame.characters,
				minions,
			};
		}

		// Handle minion target (format: "minion:id")
		if (targetValue.startsWith('minion:')) {
			const minionId = parseInt(targetValue.slice('minion:'.length), 10);
			const minion = await this.kobold.minion.read({ id: minionId });
			if (minion) {
				return {
					characters: [],
					minions: [minion],
				};
			}
			return { characters: [], minions: [] };
		}

		// Handle character target (matched by name)
		const matchedCharacter = activeGame.characters.find(
			character => character.name.toLowerCase().trim() === targetValue.toLowerCase().trim()
		);

		if (matchedCharacter) {
			return {
				characters: [matchedCharacter],
				minions: [],
			};
		}

		return { characters: [], minions: [] };
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

		// Fetch minions for all characters in the target games
		// Both GMs and players can target any player's minions in the game
		const gameCharacterIds = targetGames
			.flatMap(game => game.characters)
			.filter(c => !!c)
			.map(c => c.id);

		let minionOptions: MinionWithRelations[] = [];
		if (gameCharacterIds.length > 0) {
			minionOptions = await this.kobold.minion.readManyByCharacterIds({
				characterIds: gameCharacterIds,
			});
		}

		//return the matched actors, removing any duplicates
		return {
			characterOptions,
			actorOptions,
			minionOptions,
		};
	}

	public async getCharacterOrInitActorTarget(
		intr: BaseInteraction<CacheType>,
		targetName: string
	): Promise<{
		targetSheetRecord: SheetRecord;
		targetEntity: EntityWithSheetData;
		hideStats: boolean;
		targetName: string;
	}> {
		const { characterOptions, actorOptions, minionOptions } =
			await this.getAllTargetableOptions(intr);

		// find a match from the game characters or active character
		let matchedCharacter = characterOptions.find(
			character => character.name.trim().toLowerCase() === targetName.trim().toLowerCase()
		);

		// find a match in the init actors
		let matchedInitActor = actorOptions.find(
			actor => actor.name.trim().toLowerCase() === targetName.trim().toLowerCase()
		);

		// find a match in minions
		let matchedMinion = minionOptions.find(
			minion => minion.name.trim().toLowerCase() === targetName.trim().toLowerCase()
		);

		// Determine the target (priority: init actor > minion > character)
		let targetSheetRecord: SheetRecord | null = null;
		let targetEntity: EntityWithSheetData | null = null;
		let hideStats = false;
		let actualTargetName: string | undefined;

		if (matchedInitActor) {
			targetSheetRecord = matchedInitActor.sheetRecord;
			targetEntity = matchedInitActor;
			hideStats = matchedInitActor.hideStats;
			actualTargetName = matchedInitActor.name;
		} else if (matchedMinion) {
			// Minion's sheetRecord is now required
			targetSheetRecord = matchedMinion.sheetRecord;
			targetEntity = matchedMinion;
			actualTargetName = matchedMinion.name;
		} else if (matchedCharacter) {
			targetSheetRecord = matchedCharacter.sheetRecord;
			targetEntity = matchedCharacter;
			actualTargetName = matchedCharacter.name;
		}

		if (!targetSheetRecord || !targetEntity) {
			throw new KoboldError(
				utilStrings.roll.targetNotFound({
					targetName,
				})
			);
		}
		return { targetSheetRecord, targetEntity, hideStats, targetName: actualTargetName! };
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
