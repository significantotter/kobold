import { compileExpression } from 'filtrex';
import { Language } from '../../../models/enum-helpers/language.js';
import { DiceUtils } from '../../../utils/dice-utils.js';
import { Character, Sheet } from '../models/index.js';
import { Creature } from '../../../utils/creature.js';

export function isModifierValidForTags(
	modifier: Character['modifiers'][0],
	attributes: Character['attributes'],
	tags: string[]
): boolean {
	// compile the modifier's target tags
	const tagExpression = compileExpression(modifier.targetTags);

	const possibleTags = modifier.targetTags.match(/([A-Za-z][A-Za-z_0-9]*)/g);

	let tagTruthValues: { [k: string]: boolean | number } = {};

	for (const attribute of attributes) {
		tagTruthValues['__' + attribute.name.toLocaleLowerCase()] = attribute.value;
	}
	for (const tag of possibleTags) {
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
		modifierValidForTags = tagExpression(tagTruthValues);
	} catch (err) {
		//an invalid tag expression sneaked in! Don't catastrophically fail, though
		console.warn(err);
		modifierValidForTags = false;
	}
	return modifierValidForTags;
}

function diceWereRolled(node: any): boolean {
	// depth first search for any nodes with a type of "dice"
	// each node has a children array of expression nodes

	if (node.type === 'Dice') {
		return true;
	} else {
		// check the children
		for (const child of node.children || []) {
			if (diceWereRolled(child)) {
				return true;
			}
		}
	}
	return false;
}

export function parseBonusesForTagsFromModifiers(
	modifiers: Sheet['modifiers'],
	attributes: {
		name: string;
		value: number;
		tags?: string[];
	}[],
	tags: string[],
	creature?: Creature
) {
	const sanitizedTags = tags.map(tag => (tag ?? '').toLocaleLowerCase().trim());
	let bonuses = {};
	let penalties = {};
	const untyped = [];
	// for each modifier, check if it targets any tags for this roll
	for (const modifier of modifiers) {
		// if this modifier isn't active, move to the next one
		if (!modifier.isActive) continue;

		const modifierValidForTags = isModifierValidForTags(modifier, attributes, sanitizedTags);

		// check if any tags match between the modifier and the provided tags
		if (modifierValidForTags) {
			// A modifier can either be numeric or have a dice roll. We check to see if it's numeric.
			// If it's numeric, we evaluate it and use that number to add to the roll.
			let modifierSubRoll = DiceUtils.parseAndEvaluateDiceExpression({
				rollExpression: modifier.value.toString(),
				skipModifiers: true, // we don't want any possibility of an infinite loop here
				creature,
				extraAttributes: attributes,
				tags,
				LL: Language.LL,
			});

			if (modifierSubRoll.error) {
				continue;
			}

			const modifierHasDice = diceWereRolled(modifierSubRoll.results.reducedExpression);

			const parsedModifier = { ...modifier, value: modifierSubRoll.parsedExpression };

			// Otherwise, we just add the full modifier to the dice roll as if it were an untyped numeric modifier.

			const modifierType = modifier.type.toLocaleLowerCase().trim();
			console.log(penalties[modifierType], parsedModifier);
			if (
				modifierHasDice ||
				!modifier.type ||
				['untyped', 'none', 'n.a.', 'un typed', 'no', 'false', 'null', 'no type'].includes(
					modifierType
				)
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
					if (Number(parsedModifier.value) < Number(penalties[modifierType].value))
						penalties[modifierType] = parsedModifier;
				} else {
					penalties[modifierType] = parsedModifier;
				}
			}
			console.log(penalties[modifierType]);
			console.log('\n');
		}
	}
	return { bonuses, penalties, untyped };
}
