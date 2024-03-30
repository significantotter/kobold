import { AutocompleteInteraction, CacheType } from 'discord.js';
import { sql } from 'drizzle-orm';
import _ from 'lodash';
import { CharacterWithRelations, InitiativeActor, Kobold } from 'kobold-db';
import { CompendiumModel } from 'pf2etools-data';
import { CompendiumUtils } from 'pf2etools-data';
import { Creature } from '../creature.js';
import { InitiativeBuilderUtils } from '../initiative-builder.js';
import { FinderHelpers } from '../kobold-helpers/finder-helpers.js';
import { StringUtils } from '../string-utils.js';
import type { KoboldUtils } from './kobold-utils.js';
import { DrizzleUtils } from 'pf2etools-data';

export class AutocompleteUtils {
	public kobold: Kobold;
	constructor(private koboldUtils: KoboldUtils) {
		this.kobold = koboldUtils.kobold;
	}
	public async searchCompendium(
		intr: AutocompleteInteraction<CacheType>,
		matchText: string,
		compendium: CompendiumModel
	) {
		const choices = await CompendiumUtils.getSearchNameValue(matchText, compendium);

		const sorter = StringUtils.generateSorterByWordDistance<{
			name: string;
			value: string;
		}>(matchText, c => c.name);
		return choices.sort(sorter).slice(0, 50);
	}

	public async getBestiaryCreatures(
		intr: AutocompleteInteraction<CacheType>,
		compendium: CompendiumModel,
		matchText: string
	) {
		const targetBestiaryCreatures = await compendium.db.query.Creatures.findMany({
			where: DrizzleUtils.ilike(compendium.creatures.table.search, `%${matchText}%`),
			orderBy: sql`RANDOM()`,
			limit: 49,
		});
		return targetBestiaryCreatures.map(npc => {
			return { name: npc.search, value: npc.search };
		});
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
		const creature = Creature.fromSheetRecord(activeCharacter.sheetRecord);

		//find a save on the character matching the autocomplete string
		const matchedActions = FinderHelpers.matchAllActions(
			activeCharacter.sheetRecord,
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

		const creature = Creature.fromSheetRecord(character.sheetRecord);

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

		const matchedActions = FinderHelpers.matchAllActions(character.sheetRecord, matchText).map(
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
			activeCharacter.sheetRecord,
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

	public async getInitTargetOptions(intr: AutocompleteInteraction<CacheType>, matchText: string) {
		const currentInit = await this.koboldUtils.initiativeUtils.getInitiativeForChannelOrNull(
			intr.channel
		);
		if (!currentInit) return [];

		const actorOptions = currentInit.actors.filter(actor =>
			actor.name.toLocaleLowerCase().includes(matchText.toLocaleLowerCase())
		);

		//return the matched actors
		return [
			{ name: '(None)', value: '__NONE__' },
			...actorOptions.map(actor => ({
				name: actor.name,
				value: actor.name,
			})),
		];
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

		const creature = Creature.fromSheetRecord(actor.sheetRecord);

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
		const { characterOptions, actorOptions } =
			await this.koboldUtils.gameUtils.getAllTargetableOptions(intr);

		const allOptions = [
			{ name: '(None)', value: '__NONE__' },
			...actorOptions.map(c => ({ name: c.name, value: c.name })),
			...characterOptions.map(c => ({ name: c.name, value: c.name })),
		];

		//return the matched actors, removing any duplicates
		const result = _.uniqBy(allOptions, 'name').sort((a, b) => a.name.localeCompare(b.name));

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
			const modifiers = character.sheetRecord.modifiers;
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
}
