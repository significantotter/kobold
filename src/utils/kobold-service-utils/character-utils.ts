import _ from 'lodash';
import { Creature, roll, rollable } from '../creature.js';
import { StringUtils } from '../string-utils.js';
import { AutocompleteInteraction, CacheType, CommandInteraction } from 'discord.js';
import {
	Action,
	Character,
	CharacterModel,
	Modifier,
	RollMacro,
} from '../../services/kobold/index.js';
import type { KoboldUtils } from './kobold-utils.js';
import { Kobold } from '../../services/kobold/kobold.model.js';

const characterIdRegex = /characters\/([0-9]+)/;
const pastebinIdRegex = /pastebin\.com(?:\/raw)?\/([A-Za-z0-9]+)/;

export class CharacterUtils {
	private kobold: Kobold;
	constructor(private koboldUtils: KoboldUtils) {
		this.kobold = koboldUtils.kobold;
	}

	/**
	 * Given a string, finds all skills containing that string on a given character
	 * @param targetCharacter the character to check for matching skills
	 * @param skillText the text to match to skills
	 * @returns all skills that contain the given skillText
	 */
	public async findCharacterByName(nameText: string, userId: string): Promise<Character[]> {
		const results = await this.findCharacterByName(nameText, userId);
		const closestByName = StringUtils.generateSorterByWordDistance<Character>(
			nameText,
			character => character.name
		);
		return results.sort(closestByName);
	}

	/**
	 * Given a string, finds all skills containing that string on a given character
	 * @param targetCharacter the character to check for matching skills
	 * @param skillText the text to match to skills
	 * @returns all skills that contain the given skillText
	 */
	public findPossibleSkillFromString(targetCharacter: Character, skillText: string): roll[] {
		const matchedSkills = [];
		const creature = Creature.fromCharacter(targetCharacter);

		const saves = _.values(creature.skillRolls);

		for (const save of saves) {
			if (save.name.toLowerCase().includes(skillText.toLowerCase())) {
				matchedSkills.push(save);
			}
		}
		return matchedSkills;
	}

	/**
	 * Given a string, finds all saves containing that string on a given character
	 * @param targetCharacter the character to check for matching saves
	 * @param saveText the text to match to saves
	 * @returns all saves that contain the given saveText
	 */
	public findPossibleSaveFromString(targetCharacter: Character, saveText: string): roll[] {
		const matchedSaves = [];

		const creature = Creature.fromCharacter(targetCharacter);

		const saves = _.values(creature.savingThrowRolls);

		for (const save of saves) {
			if (save.name.toLowerCase().includes(saveText.toLowerCase())) {
				matchedSaves.push(save);
			}
		}
		return matchedSaves;
	}

	/**
	 * Given a string, finds all roll macros containing that string on a given character
	 * @param targetCharacter the character to check for matching roll macros
	 * @param rollMacroText the text to match to roll macros
	 * @returns all roll macros that contain the given roll macroText
	 */
	public findPossibleRollMacroFromString(
		targetCharacter: Character,
		rollMacroText: string
	): Character['rollMacros'] {
		const matchedRollMacros = [];
		for (const rollMacro of targetCharacter.rollMacros || []) {
			if (rollMacro.name.toLowerCase().includes(rollMacroText.toLowerCase())) {
				matchedRollMacros.push(rollMacro);
			}
		}
		return matchedRollMacros;
	}

	/**
	 * Given a string, finds all modifiers containing that string on a given character
	 * @param targetCharacter the character to check for matching modifiers
	 * @param modifierText the text to match to modifiers
	 * @returns all modifiers that contain the given modifierText
	 */
	public findPossibleModifierFromString(
		targetCharacter: Character,
		modifierText: string
	): Modifier[] {
		const matchedModifiers = [];
		for (const modifier of targetCharacter.modifiers || []) {
			if (modifier.name.toLowerCase().includes(modifierText.toLowerCase())) {
				matchedModifiers.push(modifier);
			}
		}
		return matchedModifiers;
	}

	/**
	 * Given a string, finds all actions containing that string on a given character
	 * @param targetCharacter the character to check for matching actions
	 * @param actionText the text to match to actions
	 * @returns all actions that contain the given actionText
	 */
	public findPossibleActionFromString(targetCharacter: Character, actionText: string): Action[] {
		const matchedActions = [];
		for (const action of targetCharacter.actions || []) {
			if (action.name.toLowerCase().includes(actionText.toLowerCase())) {
				matchedActions.push(action);
			}
		}
		return matchedActions;
	}

	/**
	 * Given a string, finds all ability scores containing that string on a given character
	 * @param targetCharacter the character to check for matching ability scores
	 * @param abilityText the text to match to ability scores
	 * @returns all ability scores that contain the given abilityText
	 */
	public findPossibleAbilityFromString(targetCharacter: Character, abilityText: string): roll[] {
		const matchedAbility = [];

		const creature = Creature.fromCharacter(targetCharacter);

		const attacks = _.values(creature.abilityRolls);

		for (const attack of attacks) {
			if (attack.name.toLowerCase().includes(abilityText.toLowerCase())) {
				matchedAbility.push(attack);
			}
		}
		return matchedAbility;
	}

	/**
	 * Given a string, finds all attacks containing that string on a given character
	 * @param targetCharacter the character to check for matching attacks
	 * @param attackText the text to match to attacks
	 * @returns all attacks that contain the given attackText
	 */
	public findPossibleAttackFromString(
		targetCharacter: Character,
		attackText: string
	): rollable[] {
		const matchedAttack = [];

		const creature = Creature.fromCharacter(targetCharacter);

		const attacks = _.values(creature.attackRolls);

		for (const attack of attacks) {
			if (attack.name.toLowerCase().includes(attackText.toLowerCase())) {
				matchedAttack.push(attack);
			}
		}
		return matchedAttack;
	}

	/**
	 * Gets the active character for a user
	 * @param userId the discord use
	 * @returns the active character for the user, or null if one is not present
	 */
	public async getActiveCharacter(
		intr: CommandInteraction | AutocompleteInteraction<CacheType>
	): Promise<Character | null> {
		const { user, guildId, channelId } = intr;
		const userId = user.id;
		return this.kobold.character.readActive({
			userId,
			guildId: guildId ?? undefined,
			channelId,
		});
	}

	/**
	 * Parses the text to find a character id out of a url or parses full string as a number
	 * @param text either a wanderer's guide url, or simply a numeric character id
	 */
	public parseCharacterIdFromText(text: string): number | null {
		const trimmedText = text.trim();
		let charId = null;
		if (!isNaN(Number(trimmedText.trim()))) {
			// we allow just a character id to be passed in as well
			charId = Number(trimmedText.trim());
		} else {
			// match the trimmedText to the regex
			const matches = trimmedText.match(characterIdRegex);
			if (!matches) {
				charId = null;
			} else charId = Number(matches[1]);
		}
		return charId;
	}

	/**
	 * Parses the text to find a pastebin id out of a url or parses full string as a number
	 * @param text either a pastebin url, or simply a pastebin post id
	 */
	public parsePastebinIdFromText(text: string): string | null {
		const trimmedText = text.trim();
		let pastebinId: string | null = null;
		if (/^([A-Za-z0-9]+)$/.test(trimmedText)) {
			// we allow just a pastebin id to be passed in as well
			pastebinId = text;
		} else {
			// match the trimmedText to the regex
			const matches = trimmedText.match(pastebinIdRegex);
			if (!matches) {
				pastebinId = null;
			} else pastebinId = matches[1];
		}
		return pastebinId;
	}

	/**
	 * Fetches a character's roll macro by the roll macro's name
	 * @param name the name of the roll macro
	 * @returns the roll macro
	 */
	public getRollMacroByName(character: Character, name: string): RollMacro | undefined {
		return character.rollMacros.find(
			rollMacro =>
				rollMacro.name.toLocaleLowerCase().trim() === name.toLocaleLowerCase().trim()
		);
	}

	/**
	 * Fetches a character's action by the action name
	 * @param name the name of the action
	 * @returns the action
	 */
	public getActionByName(character: Character, name: string): Action | undefined {
		return character.actions.find(
			action => action.name.toLocaleLowerCase().trim() === name.toLocaleLowerCase().trim()
		);
	}
}
