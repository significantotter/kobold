import _ from 'lodash';
import { Action, Modifier, RollMacro, SheetRecord } from 'kobold-db';
import { Creature, roll, rollable } from '../creature.js';

export class FinderHelpers {
	/**
	 * Fetches a sheetRecord's roll macro by the roll macro's name
	 * @param name the name of the roll macro
	 * @returns the roll macro
	 */
	public static getRollMacroByName(
		sheetRecord: SheetRecord,
		name: string
	): RollMacro | undefined {
		return sheetRecord.rollMacros.find(
			rollMacro =>
				rollMacro.name.toLocaleLowerCase().trim() === name.toLocaleLowerCase().trim()
		);
	}

	/**
	 * Fetches a sheetRecord's action by the action name
	 * @param name the name of the action
	 * @returns the action
	 */
	public static getActionByName(sheetRecord: SheetRecord, name: string): Action | undefined {
		return sheetRecord.actions.find(
			action => action.name.toLocaleLowerCase().trim() === name.toLocaleLowerCase().trim()
		);
	}

	/**
	 * Fetches a sheetRecord's modifier by the modifier name
	 * @param name the name of the modifier
	 * @returns the modifier
	 */
	public static getModifierByName(sheetRecord: SheetRecord, name: string): Modifier | undefined {
		return sheetRecord.modifiers.find(
			modifier => modifier.name.toLocaleLowerCase().trim() === name.toLocaleLowerCase().trim()
		);
	}

	/**
	 * Fetches a sheetRecord's modifier by the modifier name
	 * @param name the name of the modifier
	 * @returns the modifier
	 */
	public static getConditionByName(sheetRecord: SheetRecord, name: string): Modifier | undefined {
		return sheetRecord.conditions.find(
			modifier => modifier.name.toLocaleLowerCase().trim() === name.toLocaleLowerCase().trim()
		);
	}

	/**
	 * Given a string, finds all skills containing that string on a given creature
	 * @param targetSheet the creature to check for matching skills
	 * @param skillText the text to match to skills
	 * @returns all skills that contain the given skillText
	 */
	public static matchAllSkills(creature: Creature, skillText: string): roll[] {
		const matchedSkills = [];

		const saves = _.values(creature.skillRolls);

		for (const save of saves) {
			if (save.name.toLowerCase().includes(skillText.toLowerCase())) {
				matchedSkills.push(save);
			}
		}
		return matchedSkills;
	}

	/**
	 * Given a string, finds all saves containing that string on a given creature
	 * @param targetSheet the creature to check for matching saves
	 * @param saveText the text to match to saves
	 * @returns all saves that contain the given saveText
	 */
	public static matchAllSaves(creature: Creature, saveText: string): roll[] {
		const matchedSaves = [];

		const saves = _.values(creature.savingThrowRolls);

		for (const save of saves) {
			if (save.name.toLowerCase().includes(saveText.toLowerCase())) {
				matchedSaves.push(save);
			}
		}
		return matchedSaves;
	}

	/**
	 * Given a string, finds all roll macros containing that string on a given sheetRecord record
	 * @param targetSheetRecord the sheetRecord record to check for matching roll macros
	 * @param rollMacroText the text to match to roll macros
	 * @returns all roll macros that contain the given roll macroText
	 */
	public static matchAllRollMacros(
		targetSheetRecord: SheetRecord,
		rollMacroText: string
	): RollMacro[] {
		const matchedRollMacros = [];
		for (const rollMacro of targetSheetRecord.rollMacros || []) {
			if (rollMacro.name.toLowerCase().includes(rollMacroText.toLowerCase())) {
				matchedRollMacros.push(rollMacro);
			}
		}
		return matchedRollMacros;
	}

	/**
	 * Given a string, finds all modifiers containing that string on a given sheet record
	 * @param targetSheetRecord the sheet record to check for matching modifiers
	 * @param modifierText the text to match to modifiers
	 * @returns all modifiers that contain the given modifierText
	 */
	public static matchAllModifiers(
		targetSheetRecord: SheetRecord,
		modifierText: string
	): Modifier[] {
		const matchedModifiers = [];
		for (const modifier of targetSheetRecord.modifiers || []) {
			if (modifier.name.toLowerCase().includes(modifierText.toLowerCase())) {
				matchedModifiers.push(modifier);
			}
		}
		return matchedModifiers;
	}

	/**
	 * Given a string, finds all conditions containing that string on a given sheet record
	 * @param targetSheetRecord the sheet record to check for matching conditions
	 * @param conditionText the text to match to conditions
	 * @returns all conditions that contain the given conditionText
	 */
	public static matchAllConditions(
		targetSheetRecord: SheetRecord,
		conditionText: string
	): Modifier[] {
		const matchedConditions = [];
		for (const condition of targetSheetRecord.conditions || []) {
			if (condition.name.toLowerCase().includes(conditionText.toLowerCase())) {
				matchedConditions.push(condition);
			}
		}
		return matchedConditions;
	}

	/**
	 * Given a string, finds all actions containing that string on a given sheet record record
	 * @param targetSheetRecord the sheet record record to check for matching actions
	 * @param actionText the text to match to actions
	 * @returns all actions that contain the given actionText
	 */
	public static matchAllActions(targetSheetRecord: SheetRecord, actionText: string): Action[] {
		const matchedActions = [];
		for (const action of targetSheetRecord.actions || []) {
			if (action.name.toLowerCase().includes(actionText.toLowerCase())) {
				matchedActions.push(action);
			}
		}
		return matchedActions;
	}

	/**
	 * Given a string, finds all attacks containing that string on a given creature
	 * @param targetSheet the creature to check for matching attacks
	 * @param attackText the text to match to attacks
	 * @returns all attacks that contain the given attackText
	 */
	public static matchAllAttacks(creature: Creature, attackText: string): rollable[] {
		const matchedAttack = [];

		const attacks = _.values(creature.attackRolls);

		for (const attack of attacks) {
			if (attack.name.toLowerCase().includes(attackText.toLowerCase())) {
				matchedAttack.push(attack);
			}
		}
		return matchedAttack;
	}
}
