import { compileExpression } from 'filtrex';
import L from '../../i18n/i18n-node.js';
import { Attribute, Kobold, Modifier } from 'kobold-db';
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
	public static getSeverityAppliedModifier(modifier: Modifier) {
		const adjustedModifier = _.cloneDeep(modifier);
		if (adjustedModifier.severity != null) {
			if (adjustedModifier.sheetAdjustments.length) {
				adjustedModifier.sheetAdjustments.forEach(
					adjustment =>
						(adjustment.value = adjustment.value.replaceAll(
							severityRegex,
							adjustedModifier.severity!.toString()
						))
				);
			} else if (adjustedModifier.rollAdjustment) {
				adjustedModifier.rollAdjustment = adjustedModifier.rollAdjustment.replaceAll(
					severityRegex,
					adjustedModifier.severity!.toString()
				);
			}
		}
		return adjustedModifier;
	}
	public static isModifierValidForTags(
		modifier: Modifier,
		attributes: Attribute[],
		tags: string[]
	): boolean {
		if (modifier.sheetAdjustments.length) return false;

		const possibleTags = (modifier.rollTargetTags ?? '').match(/([A-Za-z][A-Za-z_0-9]*)/g);

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
			const tagExpression = compileExpression(modifier.rollTargetTags ?? '');
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
		let bonuses: { [k: string]: Modifier } = {};
		let penalties: { [k: string]: Modifier } = {};
		const untyped: Modifier[] = [];
		// for each modifier, check if it targets any tags for this roll
		for (const modifierIter of modifiers) {
			// if this modifier isn't active, move to the next one
			if (
				!modifierIter.isActive ||
				modifierIter.sheetAdjustments ||
				modifierIter.rollAdjustment == null
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
				let modifier: Modifier;
				if (modifierIter.severity !== null) {
					modifier = this.getSeverityAppliedModifier(modifierIter);
				} else {
					modifier = modifierIter;
				}
				try {
					// A modifier can either be numeric or have a dice roll. We check to see if it's numeric.
					// If it's numeric, we evaluate it and use that number to add to the roll.
					let modifierSubRoll = DiceUtils.parseAndEvaluateDiceExpression({
						rollExpression: modifier.rollAdjustment!.toString(),
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
							if (
								Number(parsedModifier.rollAdjustment) >
								Number(bonuses[modifierType].rollAdjustment)
							)
								bonuses[modifierType] = parsedModifier;
						} else {
							bonuses[modifierType] = parsedModifier;
						}
					} else if (modifierSubRoll.results.total < 0) {
						// apply a penalty
						if (penalties[modifierType]) {
							if (
								Number(parsedModifier.rollAdjustment) <
								Number(penalties[modifierType].rollAdjustment)
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
