import { AutocompleteInteraction, CacheType } from 'discord.js';
import _ from 'lodash';
import { Character } from '../services/kobold/models/index.js';
import { CharacterUtils } from './character-utils.js';

export class AutocompleteUtils {
	public static async getTargetActionForActiveCharacter(
		intr: AutocompleteInteraction<CacheType>,
		matchText: string
	) {
		//get the active character
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr.user.id, intr.guildId);
		if (!activeCharacter) {
			//no choices if we don't have a character to match against
			return [];
		}
		//find a save on the character matching the autocomplete string
		const matchedActions = CharacterUtils.findPossibleActionFromString(
			activeCharacter,
			matchText
		).map(action => ({
			name: action.name,
			value: action.name,
		}));
		//return the matched saves
		return matchedActions;
	}

	public static async getAllMatchingRollsForActiveCharacter(
		intr: AutocompleteInteraction<CacheType>,
		matchText: string
	) {
		const choices: Set<string> = new Set();
		if (matchText === '' || 'dice'.includes(matchText.toLocaleLowerCase())) choices.add('Dice');

		//get the active character
		const character = await CharacterUtils.getActiveCharacter(intr.user.id, intr.guildId);
		if (!character) {
			return [];
		}

		// add skills
		const matchedSkills = CharacterUtils.findPossibleSkillFromString(character, matchText).map(
			skill => skill.Name
		);
		for (const skill of matchedSkills) {
			choices.add(_.capitalize(skill));
		}

		// add saves
		const matchedSaves = CharacterUtils.findPossibleSaveFromString(character, matchText).map(
			save => save.Name
		);
		for (const save of matchedSaves) {
			choices.add(_.capitalize(save));
		}
		// add abilities
		const matchedAbilities = CharacterUtils.findPossibleAbilityFromString(
			character,
			matchText
		).map(ability => ability.Name);
		for (const ability of matchedAbilities) {
			choices.add(_.capitalize(ability));
		}

		choices.delete('');

		const results = [];
		let counter = 0;
		for (const value of choices.values()) {
			if (counter > 90) continue;
			results.push({ name: value, value: value });
			counter++;
		}
		return results;
	}
}
