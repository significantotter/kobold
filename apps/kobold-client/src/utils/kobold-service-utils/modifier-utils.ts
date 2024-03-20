import { compileExpression } from 'filtrex';
import L from '../../i18n/i18n-node.js';
import { Attribute, Kobold, Modifier, RollModifier, SheetModifier } from 'kobold-db';
import type { Creature } from '../creature.js';
import { DiceUtils } from '../dice-utils.js';
import type { KoboldUtils } from './kobold-utils.js';
import _ from 'lodash';

const severityRegex = /\[[\W_\*]*severity[\W_\*]*\]/gi;
export class ModifierUtils {
	private kobold: Kobold;
	public static severityRegex = severityRegex;
	constructor(koboldUtils: KoboldUtils) {
		this.kobold = koboldUtils.kobold;
	}
	public static getSeverityAppliedModifier<T extends SheetModifier | RollModifier>(
		modifier: T
	): T {
		const adjustedModifier = _.cloneDeep(modifier);
		if (adjustedModifier.modifierType === 'sheet') {
			if (adjustedModifier.severity != null) {
				adjustedModifier.sheetAdjustments.forEach(
					adjustment =>
						(adjustment.value = adjustment.value.replaceAll(
							severityRegex,
							adjustedModifier.severity!.toString()
						))
				);
			}
			return adjustedModifier;
		} else {
			if (adjustedModifier.severity != null) {
				adjustedModifier.value = adjustedModifier.value.replaceAll(
					severityRegex,
					adjustedModifier.severity!.toString()
				);
			}
			return adjustedModifier;
		}
	}
	public static isModifierValidForTags(
		modifier: Modifier,
		attributes: Attribute[],
		tags: string[]
	): boolean {
		if (modifier.modifierType === 'sheet') return false;

		const possibleTags = (modifier.targetTags ?? '').match(/([A-Za-z][A-Za-z_0-9]*)/g);

		let tagTruthValues: { [k: string]: boolean | number } = {};

		for (const attribute of attributes) {
			tagTruthValues['__' + attribute.name.toLocaleLowerCase()] = attribute.value;
		}
		for (const tag of possibleTags ?? []) {
			if (
				// exclude words used by the grammar
				[
					'and',
					'or',
					'not',
					'in',
					'abs',
					'ceil',
					'floor',
					'log',
					'max',
					'min',
					'random',
					'round',
					'sqrt',
				].includes(tag)
			)
				continue;

			tagTruthValues[tag] = tags.includes(tag.toLocaleLowerCase().trim());
		}

		let modifierValidForTags;
		try {
			// compile the modifier's target tags
			const tagExpression = compileExpression(modifier.targetTags ?? '');
			modifierValidForTags = tagExpression(tagTruthValues);
		} catch (err) {
			//an invalid tag expression sneaked in! Don't catastrophically fail, though
			console.warn(err);
			modifierValidForTags = false;
		}
		return modifierValidForTags;
	}

	public static diceWereRolled(node: any): boolean {
		// depth first search for any nodes with a type of "dice"
		// each node has a children array of expression nodes

		if (node.type === 'Dice') {
			return true;
		} else {
			// check the children
			for (const child of node.children || []) {
				if (ModifierUtils.diceWereRolled(child)) {
					return true;
				}
			}
		}
		return false;
	}

	public static parseBonusesForTagsFromModifiers(
		modifiers: Modifier[],
		attributes: Attribute[],
		tags: string[],
		creature?: Creature
	) {
		const sanitizedTags = tags.map(tag => (tag ?? '').toLocaleLowerCase().trim());
		let bonuses: { [k: string]: RollModifier } = {};
		let penalties: { [k: string]: RollModifier } = {};
		const untyped: Modifier[] = [];
		// for each modifier, check if it targets any tags for this roll
		for (const modifierIter of modifiers) {
			// if this modifier isn't active, move to the next one
			if (
				!modifierIter.isActive ||
				modifierIter.modifierType === 'sheet' ||
				modifierIter.value == null
			)
				continue;

			const modifierValidForTags = ModifierUtils.isModifierValidForTags(
				modifierIter,
				attributes,
				sanitizedTags
			);

			// check if any tags match between the modifier and the provided tags
			if (modifierValidForTags) {
				// if the modifier has a severity, replace any severity text in the modifier with the actual severity
				let modifier: RollModifier;
				if (modifierIter.severity !== null) {
					modifier = this.getSeverityAppliedModifier(modifierIter);
				} else {
					modifier = modifierIter;
				}
				try {
					// A modifier can either be numeric or have a dice roll. We check to see if it's numeric.
					// If it's numeric, we evaluate it and use that number to add to the roll.
					let modifierSubRoll = DiceUtils.parseAndEvaluateDiceExpression({
						rollExpression: modifier.value.toString(),
						skipModifiers: true, // we don't want any possibility of an infinite loop here
						creature,
						extraAttributes: attributes,
						tags,
					});

					const modifierHasDice = ModifierUtils.diceWereRolled(
						modifierSubRoll.results?.reducedExpression ?? {}
					);

					const parsedModifier = { ...modifier, value: modifierSubRoll.parsedExpression };

					// Otherwise, we just add the full modifier to the dice roll as if it were an untyped numeric modifier.

					const modifierType = modifier.type.toLocaleLowerCase().trim();
					if (
						modifierHasDice ||
						!modifier.type ||
						[
							'untyped',
							'none',
							'n.a.',
							'un typed',
							'no',
							'false',
							'null',
							'no type',
						].includes(modifierType)
					) {
						untyped.push(parsedModifier);
					}
					// apply the modifier
					else if (modifierSubRoll.results.total > 0) {
						// apply a bonus
						if (bonuses[modifierType]) {
							if (Number(parsedModifier.value) > Number(bonuses[modifierType].value))
								bonuses[modifierType] = parsedModifier;
						} else {
							bonuses[modifierType] = parsedModifier;
						}
					} else if (modifierSubRoll.results.total < 0) {
						// apply a penalty
						if (penalties[modifierType]) {
							if (
								Number(parsedModifier.value) < Number(penalties[modifierType].value)
							)
								penalties[modifierType] = parsedModifier;
						} else {
							penalties[modifierType] = parsedModifier;
						}
					}
				} catch (err) {
					console.warn(err);
					continue;
				}
			}
		}
		return { bonuses, penalties, untyped };
	}
}
