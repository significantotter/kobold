import _ from 'lodash';
import { Action, Condition, Counter, Modifier, RollMacro, Sheet, SheetRecord } from '@kobold/db';
import { Creature, roll, rollable } from '../creature.js';

export class FinderHelpers {
	/**
	 * Fetches a roll macro by the roll macro's name from an array of roll macros
	 * @param rollMacros the array of roll macros to search
	 * @param name the name of the roll macro
	 * @returns the roll macro
	 */
	public static getRollMacroByName(rollMacros: RollMacro[], name: string): RollMacro | undefined {
		return rollMacros.find(
			rollMacro =>
				rollMacro.name.toLocaleLowerCase().trim() === name.toLocaleLowerCase().trim()
		);
	}

	/**
	 * Fetches an action by the action name from an array of actions
	 * @param actions the array of actions to search
	 * @param name the name of the action
	 * @returns the action
	 */
	public static getActionByName(actions: Action[], name: string): Action | undefined {
		return actions.find(
			action => action.name.toLocaleLowerCase().trim() === name.toLocaleLowerCase().trim()
		);
	}

	/**
	 * Fetches a modifier by the modifier name from an array of modifiers
	 * @param modifiers the array of modifiers to search
	 * @param name the name of the modifier
	 * @returns the modifier
	 */
	public static getModifierByName(modifiers: Modifier[], name: string): Modifier | undefined {
		return modifiers.find(
			modifier => modifier.name.toLocaleLowerCase().trim() === name.toLocaleLowerCase().trim()
		);
	}

	/**
	 * Fetches a sheetRecord's counter group by the counter group name
	 * @param name the name of the counter group
	 * @returns the counter group
	 */
	public static getCounterGroupByName(
		counterGroups: SheetRecord['sheet']['counterGroups'],
		name: string
	): SheetRecord['sheet']['counterGroups'][0] | undefined {
		return counterGroups.find(
			counterGroup =>
				counterGroup.name.toLocaleLowerCase().trim() === name.toLocaleLowerCase().trim()
		);
	}

	/**
	 * Fetches a sheetRecord's counter group by the counter group name
	 * @param name the name of the counter group
	 * @returns the counter group
	 */
	public static getCounterByName(sheet: Sheet, name: string) {
		let [counterName, groupName] = name
			.replaceAll(')', '')
			.trim()
			.toLocaleLowerCase()
			.split(' (');

		if (groupName) {
			for (const counterGroup of sheet.counterGroups) {
				if (groupName && groupName !== counterGroup.name.toLocaleLowerCase().trim())
					continue;
				const counter = counterGroup.counters.find(
					counter => counter.name.toLocaleLowerCase().trim() === counterName
				);
				if (counter) {
					return { counter, group: counterGroup };
				}
			}
		} else {
			for (const counter of sheet.countersOutsideGroups) {
				if (counter.name.toLocaleLowerCase().trim() === counterName) {
					return { counter, group: null };
				}
			}
		}
		return { counter: null, group: null };
	}

	/**
	 * Fetches a sheetRecord's condition by the condition name
	 * @param name the name of the condition
	 * @returns the condition
	 */
	public static getConditionByName(
		sheetRecord: SheetRecord,
		name: string
	): Condition | undefined {
		return sheetRecord.conditions.find(
			condition =>
				condition.name.toLocaleLowerCase().trim() === name.toLocaleLowerCase().trim()
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
	 * Given a string, finds all roll macros containing that string from an array of roll macros
	 * @param rollMacros the array of roll macros to search
	 * @param rollMacroText the text to match to roll macros
	 * @returns all roll macros that contain the given roll macroText
	 */
	public static matchAllRollMacros(rollMacros: RollMacro[], rollMacroText: string): RollMacro[] {
		const matchedRollMacros = [];
		for (const rollMacro of rollMacros || []) {
			if (rollMacro.name.toLowerCase().includes(rollMacroText.toLowerCase())) {
				matchedRollMacros.push(rollMacro);
			}
		}
		return matchedRollMacros;
	}

	/**
	 * Given a string, finds all modifiers containing that string from an array of modifiers
	 * @param modifiers the array of modifiers to search
	 * @param modifierText the text to match to modifiers
	 * @returns all modifiers that contain the given modifierText
	 */
	public static matchAllModifiers(modifiers: Modifier[], modifierText: string): Modifier[] {
		const matchedModifiers = [];
		for (const modifier of modifiers || []) {
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
	): Condition[] {
		const matchedConditions = [];
		for (const condition of targetSheetRecord.conditions || []) {
			if (condition.name.toLowerCase().includes(conditionText.toLowerCase())) {
				matchedConditions.push(condition);
			}
		}
		return matchedConditions;
	}

	/**
	 * Given a string, finds all actions containing that string from an array of actions
	 * @param actions the array of actions to search
	 * @param actionText the text to match to actions
	 * @returns all actions that contain the given actionText
	 */
	public static matchAllActions(actions: Action[], actionText: string): Action[] {
		const matchedActions = [];
		for (const action of actions || []) {
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
