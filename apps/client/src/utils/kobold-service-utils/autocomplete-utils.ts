import { AutocompleteInteraction, CacheType } from 'discord.js';
import _ from 'lodash';
import {
	CharacterWithRelations,
	CounterStyleEnum,
	InitiativeActor,
	Kobold,
	MinionWithRelations,
} from '@kobold/db';
import { Creature } from '../creature.js';
import { InitiativeBuilderUtils } from '../initiative-builder.js';
import { FinderHelpers } from '../kobold-helpers/finder-helpers.js';
import type { KoboldUtils } from './kobold-utils.js';
import { NethysDb } from '@kobold/nethys';

/** Special values for create-for and assign-to autocomplete options */
export const CreateForTargets = {
	USER: 'user',
	CHARACTER_PREFIX: 'character:',
	MINION_PREFIX: 'minion:',
} as const;

/** Special values for owned-by filter in list commands */
export const OwnedByFilters = {
	EVERYONE: 'everyone',
	USER: 'user',
	CHARACTER_PREFIX: 'character:',
	MINION_PREFIX: 'minion:',
} as const;

/**
 * Parses the create-for or assign-to value and returns the sheetRecordId
 * or null for user-wide scope
 */
export function parseCreateForValue(
	value: string | null,
	characters: CharacterWithRelations[],
	minions: MinionWithRelations[]
): number | null {
	if (!value || value === CreateForTargets.USER) {
		return null; // User-wide scope
	}

	if (value.startsWith(CreateForTargets.CHARACTER_PREFIX)) {
		const sheetRecordId = parseInt(value.slice(CreateForTargets.CHARACTER_PREFIX.length), 10);
		const character = characters.find(c => c.sheetRecordId === sheetRecordId);
		return character?.sheetRecordId ?? null;
	}

	if (value.startsWith(CreateForTargets.MINION_PREFIX)) {
		const sheetRecordId = parseInt(value.slice(CreateForTargets.MINION_PREFIX.length), 10);
		const minion = minions.find(m => m.sheetRecordId === sheetRecordId);
		return minion?.sheetRecordId ?? null;
	}

	return null;
}

/**
 * Parses the owned-by filter value and returns the filter parameters
 */
export function parseOwnedByFilter(
	value: string | null
): 'all' | 'user' | { sheetRecordId: number } {
	if (!value || value === OwnedByFilters.EVERYONE) {
		return 'all';
	}

	if (value === OwnedByFilters.USER) {
		return 'user';
	}

	if (value.startsWith(OwnedByFilters.CHARACTER_PREFIX)) {
		const sheetRecordId = parseInt(value.slice(OwnedByFilters.CHARACTER_PREFIX.length), 10);
		return { sheetRecordId };
	}

	if (value.startsWith(OwnedByFilters.MINION_PREFIX)) {
		const sheetRecordId = parseInt(value.slice(OwnedByFilters.MINION_PREFIX.length), 10);
		return { sheetRecordId };
	}

	return 'all';
}

export class AutocompleteUtils {
	public kobold: Kobold;
	constructor(private koboldUtils: KoboldUtils) {
		this.kobold = koboldUtils.kobold;
	}

	public async getCounterGroups(
		intr: AutocompleteInteraction<CacheType>,
		counterGroupName: string
	) {
		const activeCharacter = await this.koboldUtils.characterUtils.getActiveCharacter(intr);
		if (!activeCharacter) return [];

		return activeCharacter.sheetRecord.sheet.counterGroups
			.map(group => ({
				name: group.name,
				value: group.name,
			}))
			.filter(group =>
				group.name.toLowerCase().includes(counterGroupName.toLowerCase().trim())
			);
	}
	public async getCounters(
		intr: AutocompleteInteraction<CacheType>,
		counterName: string,
		options = { styles: [] as CounterStyleEnum[] }
	) {
		const activeCharacter = await this.koboldUtils.characterUtils.getActiveCharacter(intr);
		if (!activeCharacter) {
			return [];
		}

		return [
			...activeCharacter.sheetRecord.sheet.countersOutsideGroups.filter(
				counter => !options.styles.length || options.styles.includes(counter.style)
			),
			...activeCharacter.sheetRecord.sheet.counterGroups.flatMap(group =>
				group.counters
					.filter(
						counter => !options.styles.length || options.styles.includes(counter.style)
					)
					.map(counter => ({
						...counter,
						name: `${counter.name} (${group.name})`,
					}))
			),
		]
			.map(counter => ({
				name: counter.name,
				value: counter.name,
			}))
			.filter(counter =>
				counter.name.toLowerCase().includes(counterName.toLowerCase().trim())
			);
	}

	public async getNethysBestiaryCreatures(nethysCompendium: NethysDb, matchText: string) {
		const searchResults = await nethysCompendium.searchTerm(matchText, {
			searchTermOnly: true,
			randomOrder: true,
			limit: 50,
			bestiary: true,
		});
		return searchResults.map(result => ({ name: result.search, value: result.search }));
	}

	public async getTargetActionForActiveCharacter(
		intr: AutocompleteInteraction<CacheType>,
		matchText: string
	) {
		//get the active character
		const activeCharacter = await this.koboldUtils.characterUtils.getActiveCharacter(intr);
		if (!activeCharacter) {
			//no choices if we don't have a character to match against
			return [];
		}
		const creature = Creature.fromSheetRecord(activeCharacter);

		//find an action on the character matching the autocomplete string
		const matchedActions = FinderHelpers.matchAllActions(
			activeCharacter.actions,
			matchText
		).map(action => ({
			name: action.name,
			value: action.name,
		}));
		//return the matched saves
		return matchedActions;
	}

	public async getAllMatchingStatRollsForActiveCharacter(
		intr: AutocompleteInteraction<CacheType>,
		matchText: string,
		extraChoices: string[] = []
	) {
		const choices: Set<string> = new Set(extraChoices);

		//get the active character
		const character = await this.koboldUtils.characterUtils.getActiveCharacter(intr);
		if (!character) {
			return [];
		}

		const creature = Creature.fromSheetRecord(character);

		// add skills
		const matchedSkills = FinderHelpers.matchAllSkills(creature, matchText).map(
			skill => skill.name
		);
		for (const skill of matchedSkills) {
			choices.add(_.capitalize(skill));
		}

		// add saves
		const matchedSaves = FinderHelpers.matchAllSaves(creature, matchText).map(
			save => save.name
		);
		for (const save of matchedSaves) {
			choices.add(_.capitalize(save));
		}

		// add attacks
		const matchedAttacks = FinderHelpers.matchAllAttacks(creature, matchText).map(
			attack => attack.name
		);
		for (const attack of matchedAttacks) {
			choices.add(_.capitalize(attack));
		}

		const matchedActions = FinderHelpers.matchAllActions(character.actions, matchText).map(
			action => action.name
		);
		for (const action of matchedActions) {
			choices.add(_.capitalize(action));
		}

		choices.delete('');

		const matchedRolls: { name: string; value: string }[] = [];
		let counter = 0;
		for (const value of choices.values()) {
			matchedRolls.push({ name: value, value: value });
			counter++;
		}

		return _.take(matchedRolls, 90);
	}

	public async getAllMatchingRollsMacrosForCharacter(
		intr: AutocompleteInteraction<CacheType>,
		matchText: string
	) {
		//get the active character
		const activeCharacter = await this.koboldUtils.characterUtils.getActiveCharacter(intr);
		if (!activeCharacter) {
			//no choices if we don't have a character to match against
			return [];
		}

		//find a save on the character matching the autocomplete string
		const matchedRollMacros = FinderHelpers.matchAllRollMacros(
			activeCharacter.rollMacros,
			matchText
		).map(modifier => ({
			name: modifier.name,
			value: modifier.name,
		}));
		//return the matched saves
		return matchedRollMacros;
	}

	public async getAllInitMembers(
		intr: AutocompleteInteraction<CacheType>,
		matchText?: string | null
	) {
		const currentInit = await this.koboldUtils.initiativeUtils.getInitiativeForChannelOrNull(
			intr.channel
		);
		if (!currentInit) return [];
		//get the character matches

		return currentInit.actorGroups
			.filter(actor => actor.name.toLowerCase().includes((matchText ?? '').toLowerCase()))
			.map(actor => ({
				name: actor.name,
				value: actor.name,
			}));
	}
	public async getAllControllableInitiativeActors(
		intr: AutocompleteInteraction<CacheType>,
		matchText?: string | null
	) {
		const currentInit = await this.koboldUtils.initiativeUtils.getInitiativeForChannelOrNull(
			intr.channel
		);
		if (!currentInit) return [];
		//get the character matches
		let actorOptions = InitiativeBuilderUtils.getControllableInitiativeActors(
			currentInit,
			intr.user.id
		);
		actorOptions = actorOptions.filter((actor: InitiativeActor) =>
			actor.name.toLowerCase().includes((matchText ?? '').toLowerCase())
		);

		//return the matched skills
		return actorOptions.map((actor: InitiativeActor) => ({
			name: actor.name,
			value: actor.name,
		}));
	}

	public async getInitTargetOptions(
		intr: AutocompleteInteraction<CacheType>,
		matchText: string,
		includeNone: boolean = true
	) {
		const currentInit = await this.koboldUtils.initiativeUtils.getInitiativeForChannelOrNull(
			intr.channel
		);
		if (!currentInit) return [];

		const actorOptions = currentInit.actors.filter(actor =>
			actor.name.toLocaleLowerCase().includes(matchText.toLocaleLowerCase())
		);

		//return the matched actors
		const results = actorOptions.map(actor => ({
			name: actor.name,
			value: actor.name,
		}));

		if (includeNone) results.unshift({ name: '(None)', value: '__NONE__' });

		return results;
	}

	public async getMatchingRollsForInitiativeSheet(
		intr: AutocompleteInteraction<CacheType>,
		matchText: string,
		targetCharacterName: string
	) {
		const currentInit = await this.koboldUtils.initiativeUtils.getInitiativeForChannelOrNull(
			intr.channel
		);
		if (!currentInit) return [];

		const actor = InitiativeBuilderUtils.getNameMatchActorFromInitiative(
			currentInit.gmUserId,
			currentInit,
			targetCharacterName,
			false
		);

		const creature = Creature.fromSheetRecord(actor);

		const allRolls = _.uniq([
			..._.keys(creature.attackRolls),
			...creature.actions.map(action => action.name),
			..._.keys(creature.rolls),
		]);

		const matchedRolls = allRolls.filter(roll =>
			roll.toLowerCase().includes(matchText.toLowerCase())
		);
		return matchedRolls.map(roll => ({
			name: roll,
			value: roll,
		}));
	}

	public async getAllTargetOptions(intr: AutocompleteInteraction<CacheType>, matchText: string) {
		const { characterOptions, actorOptions, minionOptions } =
			await this.koboldUtils.gameUtils.getAllTargetableOptions(intr);

		const allOptions = [
			{ name: '(None)', value: '__NONE__' },
			...actorOptions.map(c => ({ name: c.name, value: c.name })),
			...minionOptions.map(m => ({ name: m.name, value: m.name })),
			...characterOptions.map(c => ({ name: c.name, value: c.name })),
		];

		//return the matched actors, removing any duplicates
		const result = _.uniqBy(allOptions, 'name');

		if (matchText.length)
			return result.filter(option =>
				option.name.toLowerCase().includes(matchText.toLowerCase())
			);
		return result;
	}

	public async getAllModifiersForAllCharacters(
		intr: AutocompleteInteraction<CacheType>,
		matchText: string
	) {
		const characters = await this.kobold.character.readMany({ userId: intr.user.id });
		const modifiersWithCharacterName: string[] = [];
		for (const character of characters) {
			const modifiers = character.modifiers;
			for (const modifier of modifiers) {
				modifiersWithCharacterName.push(`${character.name} - ${modifier.name}`);
			}
		}
		return modifiersWithCharacterName
			.filter(modifier => modifier.toLowerCase().includes(matchText.toLowerCase()))
			.map(modifier => ({
				name: modifier,
				value: modifier,
			}));
	}

	public async getConditionsOnTarget(
		intr: AutocompleteInteraction<CacheType>,
		targetCharacterName: string,
		conditionName: string
	) {
		const { targetSheetRecord } =
			await this.koboldUtils.gameUtils.getCharacterOrInitActorTarget(
				intr,
				targetCharacterName
			);
		//find a save on the character matching the autocomplete string
		const matchedConditions = FinderHelpers.matchAllConditions(
			targetSheetRecord,
			conditionName
		).map(condition => ({
			name: condition.name,
			value: condition.name,
		}));
		//return the matched saves
		return matchedConditions;
	}

	/**
	 * Autocomplete for the "create-for" option in create commands.
	 * Returns "Me (All Characters)" as default, plus all user's characters and minions.
	 */
	public async getCreateForOptions(
		intr: AutocompleteInteraction<CacheType>,
		matchText: string
	): Promise<{ name: string; value: string }[]> {
		const choices: { name: string; value: string }[] = [
			{ name: '👤 Me (All Characters)', value: CreateForTargets.USER },
		];

		// Add user's characters
		const characters = await this.kobold.character.readMany({ userId: intr.user.id });
		for (const char of characters) {
			choices.push({
				name: `🎭 ${char.name}`,
				value: `${CreateForTargets.CHARACTER_PREFIX}${char.sheetRecordId}`,
			});
		}

		// Add user's minions
		const charIds = characters.map(c => c.id);
		if (charIds.length > 0) {
			const minions = await this.kobold.minion.readManyByCharacterIds({
				characterIds: charIds,
			});
			for (const minion of minions) {
				const parentChar = characters.find(c => c.id === minion.characterId);
				choices.push({
					name: `🐕 ${minion.name}${parentChar ? ` (${parentChar.name}'s minion)` : ''}`,
					value: `${CreateForTargets.MINION_PREFIX}${minion.sheetRecordId}`,
				});
			}
		}

		// Filter by typed value
		const filtered = choices.filter(c =>
			c.name.toLowerCase().includes(matchText.toLowerCase())
		);

		return filtered.slice(0, 25);
	}

	/**
	 * Autocomplete for the "owned-by" option in list commands.
	 * Returns "Everyone", "Me (All Characters)", and all user's characters and minions.
	 */
	public async getOwnedByOptions(
		intr: AutocompleteInteraction<CacheType>,
		matchText: string
	): Promise<{ name: string; value: string }[]> {
		const choices: { name: string; value: string }[] = [
			{ name: '🌐 Everyone', value: OwnedByFilters.EVERYONE },
			{ name: '👤 Me (All Characters)', value: OwnedByFilters.USER },
		];

		// Add user's characters
		const characters = await this.kobold.character.readMany({ userId: intr.user.id });
		for (const char of characters) {
			choices.push({
				name: `🎭 ${char.name}`,
				value: `${OwnedByFilters.CHARACTER_PREFIX}${char.sheetRecordId}`,
			});
		}

		// Add user's minions
		const charIds = characters.map(c => c.id);
		if (charIds.length > 0) {
			const minions = await this.kobold.minion.readManyByCharacterIds({
				characterIds: charIds,
			});
			for (const minion of minions) {
				const parentChar = characters.find(c => c.id === minion.characterId);
				choices.push({
					name: `🐕 ${minion.name}${parentChar ? ` (${parentChar.name}'s minion)` : ''}`,
					value: `${OwnedByFilters.MINION_PREFIX}${minion.sheetRecordId}`,
				});
			}
		}

		// Filter by typed value
		const filtered = choices.filter(c =>
			c.name.toLowerCase().includes(matchText.toLowerCase())
		);

		return filtered.slice(0, 25);
	}

	/**
	 * Autocomplete for the "assign-to" option in assign commands.
	 * Same as createFor but without the default selection.
	 */
	public async getAssignToOptions(
		intr: AutocompleteInteraction<CacheType>,
		matchText: string
	): Promise<{ name: string; value: string }[]> {
		return this.getCreateForOptions(intr, matchText);
	}

	/**
	 * Get all user's characters and minions for data retrieval
	 */
	public async getUserCharactersAndMinions(
		intr: AutocompleteInteraction<CacheType> | { user: { id: string } }
	): Promise<{
		characters: CharacterWithRelations[];
		minions: MinionWithRelations[];
	}> {
		const characters = await this.kobold.character.readMany({ userId: intr.user.id });
		const charIds = characters.map(c => c.id);
		const minions =
			charIds.length > 0
				? await this.kobold.minion.readManyByCharacterIds({ characterIds: charIds })
				: [];
		return { characters, minions };
	}

	/**
	 * Autocomplete for minions belonging to the active character OR unassigned.
	 * Used by minion commands that operate on the active character's minions
	 * but also allow operating on unassigned minions.
	 */
	public async getActiveCharacterMinionsWithUnassigned(
		intr: AutocompleteInteraction<CacheType>,
		matchText: string
	): Promise<{ name: string; value: string }[]> {
		const activeCharacter = await this.koboldUtils.characterUtils.getActiveCharacter(intr);
		if (!activeCharacter) return [];

		// Get all user's minions and filter to active character's minions + unassigned
		const allMinions = await this.kobold.minion.readManyByUserId({
			userId: intr.user.id,
		});
		const minions = allMinions.filter(
			(m: MinionWithRelations) =>
				m.characterId === activeCharacter.id || m.characterId === null
		);

		return minions
			.filter((m: MinionWithRelations) =>
				m.name.toLowerCase().includes((matchText ?? '').toLowerCase())
			)
			.map((m: MinionWithRelations) => ({
				name: m.characterId === null ? `${m.name} (unassigned)` : m.name,
				value: m.name,
			}));
	}

	/**
	 * Fetches minions belonging to the active character OR unassigned (raw data).
	 * Use this when you need the minion objects, not just autocomplete results.
	 */
	public async fetchActiveCharacterMinionsWithUnassigned(
		intr: AutocompleteInteraction<CacheType> | { user: { id: string } },
		activeCharacterId: number
	): Promise<MinionWithRelations[]> {
		const allMinions = await this.kobold.minion.readManyByUserId({
			userId: intr.user.id,
		});
		return allMinions.filter(
			(m: MinionWithRelations) =>
				m.characterId === activeCharacterId || m.characterId === null
		);
	}
}
