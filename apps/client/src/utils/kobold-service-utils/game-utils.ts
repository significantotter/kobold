import { BaseInteraction, CacheType } from 'discord.js';
import { utilStrings } from '@kobold/documentation';
import {
	CharacterWithRelations,
	GameCharacterLite,
	GameWithCharactersLite,
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
	public async getActiveGame(
		userId: string,
		guildId: string,
		channelId?: string
	): Promise<GameWithCharactersLite | null> {
		const games = await this.kobold.game.readManyLite({ guildId: guildId });
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
		activeGame?: GameWithCharactersLite | null,
		options: { includeMinions?: boolean } = {}
	): Promise<{ name: string; value: string }[]> {
		const { includeMinions = true } = options;

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
		if (includeMinions) {
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
		}

		result.unshift({ name: 'All Players', value: 'All Players' });
		return result;
	}

	/**
	 * Resolves the target selection from autocompleteGameCharacter to actual entities.
	 * Returns characters and their minions for "All Players", a single minion for "minion:id",
	 * or a single character matched by name.
	 *
	 * Accepts a lite game — full character relations are loaded on demand via game.read().
	 */
	public async getGameTargets(
		targetValue: string,
		activeGame: GameWithCharactersLite
	): Promise<{
		characters: CharacterWithRelations[];
		minions: MinionWithRelations[];
	}> {
		// Handle "All Players" - load full game, return all characters and their minions
		if (targetValue === 'All Players') {
			const fullGame = await this.kobold.game.read({ id: activeGame.id });
			if (!fullGame) return { characters: [], minions: [] };
			const characterIds = fullGame.characters.map(c => c.id);
			const minions =
				characterIds.length > 0
					? await this.kobold.minion.readManyByCharacterIds({ characterIds })
					: [];
			return {
				characters: fullGame.characters,
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

		// Handle character target (matched by name from lite list, then load full)
		const matchedLite = activeGame.characters.find(
			character => character.name.toLowerCase().trim() === targetValue.toLowerCase().trim()
		);

		if (matchedLite) {
			const fullCharacter = await this.kobold.character.read({ id: matchedLite.id });
			if (fullCharacter) {
				return {
					characters: [fullCharacter],
					minions: [],
				};
			}
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

		// Game characters are lite — only name/id/status plus defaults
		const gameCharacterOptions: GameCharacterLite[] = targetGames
			.flatMap(game => game.characters)
			.filter(result => !!result);

		// Owned characters have full relations
		const ownedCharacterOptions = activeCharacter ? ownedCharacters : [];

		const actorOptions = currentInit?.actors ?? [];

		// Fetch minions for all characters in the target games
		const gameCharacterIds = gameCharacterOptions.map(c => c.id);

		let minionOptions: MinionWithRelations[] = [];
		if (gameCharacterIds.length > 0) {
			minionOptions = await this.kobold.minion.readManyByCharacterIds({
				characterIds: gameCharacterIds,
			});
		}

		return {
			gameCharacterOptions,
			ownedCharacterOptions,
			actorOptions,
			minionOptions,
		};
	}

	/**
	 * Finds a targetable entity by name across init actors, minions, owned characters,
	 * and game characters. Game characters are lite and will be lazy-loaded from DB
	 * if matched.
	 */
	public async getCharacterOrInitActorTarget(
		intr: BaseInteraction<CacheType>,
		targetName: string
	): Promise<{
		targetSheetRecord: SheetRecord;
		targetEntity: EntityWithSheetData;
		hideStats: boolean;
		targetName: string;
	}> {
		const { ownedCharacterOptions, gameCharacterOptions, actorOptions, minionOptions } =
			await this.getAllTargetableOptions(intr);

		const normalizedTarget = targetName.trim().toLowerCase();

		// find a match in the init actors
		let matchedInitActor = actorOptions.find(
			actor => actor.name.trim().toLowerCase() === normalizedTarget
		);

		// find a match in minions
		let matchedMinion = minionOptions.find(
			minion => minion.name.trim().toLowerCase() === normalizedTarget
		);

		// find a match from the user's own characters (already full relations)
		let matchedOwnedCharacter = ownedCharacterOptions.find(
			character => character.name.trim().toLowerCase() === normalizedTarget
		);

		// find a match from game characters (lite — will lazy-load if used)
		let matchedGameCharacter = gameCharacterOptions.find(
			character => character.name.trim().toLowerCase() === normalizedTarget
		);

		// Determine the target (priority: init actor > minion > owned character > game character)
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
			targetSheetRecord = matchedMinion.sheetRecord;
			targetEntity = matchedMinion;
			actualTargetName = matchedMinion.name;
		} else if (matchedOwnedCharacter) {
			targetSheetRecord = matchedOwnedCharacter.sheetRecord;
			targetEntity = matchedOwnedCharacter;
			actualTargetName = matchedOwnedCharacter.name;
		} else if (matchedGameCharacter) {
			// Lazy-load full character relations for game character
			const fullCharacter = await this.kobold.character.read({ id: matchedGameCharacter.id });
			if (fullCharacter) {
				targetSheetRecord = fullCharacter.sheetRecord;
				targetEntity = fullCharacter;
				actualTargetName = fullCharacter.name;
			}
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
		const options = await this.kobold.game.readManyLite({ guildId });

		return options.filter(
			option =>
				option.characters.filter(char => char.userId === userId).length > 0 ||
				option.gmUserId === userId
		);
	}
	public async getWhereUserLacksCharacter(userId: string, guildId: string | null) {
		if (guildId == null) return [];
		const options = await this.kobold.game.readManyLite({ guildId });
		// Filter out the games that the user is already in
		return options.filter(
			option =>
				option.characters.filter(char => char.userId === userId && char.isActiveCharacter)
					.length === 0
		);
	}
}
