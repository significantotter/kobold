import { compileExpression } from 'filtrex';
import { Character } from '../models/index.js';

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

export function parseBonusesForTagsFromModifiers(
	modifiers: Character['modifiers'],
	attributes: Character['attributes'],
	tags: string[]
) {
	const sanitizedTags = tags.map(tag => tag.toLocaleLowerCase().trim());
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
			const modifierType = modifier.type.toLocaleLowerCase().trim();
			if (
				!modifier.type ||
				['untyped', 'none', 'n.a.', 'un typed', 'no', 'false', 'null', 'no type'].includes(
					modifierType
				)
			) {
				untyped.push(modifier);
			}
			// apply the modifier
			else if (modifier.value > 0) {
				// apply a bonus
				if (bonuses[modifierType]) {
					if (modifier.value > bonuses[modifierType].value)
						bonuses[modifierType] = modifier;
				} else {
					bonuses[modifierType] = modifier;
				}
			} else if (modifier.value < 0) {
				// apply a penalty
				if (penalties[modifierType]) {
					if (modifier.value < penalties[modifierType].value)
						penalties[modifierType] = modifier;
				} else {
					penalties[modifierType] = modifier;
				}
			}
		}
	}
	return { bonuses, penalties, untyped };
}
