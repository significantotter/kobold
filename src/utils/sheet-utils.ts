import _ from 'lodash';
import {
	Modifier,
	SheetAdjustment,
	Sheet,
	SheetModifier,
} from '../services/kobold/models/index.js';
import { SheetAdjuster } from './sheet-adjuster.js';

export const loreRegex = /(.*) lore$/i;
export const immunityRegex = /immunit((ies)|(y))/i;
export const resistanceRegex = /resistance(s)?/i;
export const weaknessRegex = /weakness(es)?/i;
export const languageRegex = /language(s)?/i;
export const senseRegex = /sense(s)?/i;
export const attackRegex = /attacks/i;

const operation = ['+', '-', '='] as const;
type Operation = (typeof operation)[number];
type StringLiteral<T> = T extends `${string & T}` ? T : never;

// we only want to calculate this once
export const sheetPropertyGroups = _.flatMap(
	[
		'strength',
		'dexterity',
		'constitution',
		'intelligence',
		'wisdom',
		'charisma',
		'str',
		'dex',
		'con',
		'int',
		'wis',
		'cha',
		'',
	].map(attribute => {
		if (attribute === '') {
			return ['skills', 'checks', 'saves'];
		}
		return ['Skills', 'Checks', 'Saves'].map(group => `${attribute}${group}`);
	})
);

export type TypedSheetAdjustment = SheetAdjustment & {
	type: 'untyped' | 'status' | 'circumstance' | 'item';
	propertyType:
		| 'info'
		| 'infoList'
		| 'intProperty'
		| 'baseCounter'
		| 'stat'
		| 'attack'
		| 'extraSkill'
		| 'weaknessResistance'
		| null;
};
export type reducedSheetAdjustment = {
	[type: string]: {
		[property: string]: string | number;
	};
};
export type untypedAdjustment = {
	[property: string]: string | number;
};

export class SheetUtils {
	/**
	 * Applies the value of a modifier to the target property
	 */
	static applySheetAdjustmentToProperty(property: string | number, modifier: SheetAdjustment) {
		if (modifier.operation === '=') {
			return modifier.value;
		}
		if (!isNaN(Number(property)) && modifier.operation === '+') {
			return Number(property) + Number(modifier.value);
		} else if (!isNaN(Number(property)) && modifier.operation === '-') {
			return Number(property) - Number(modifier.value);
		} else {
			return property;
		}
	}

	static spreadSheetAdjustmentGroups(sheetAdjustments: TypedSheetAdjustment[], sheet: Sheet) {
		const newSheetAdjustments: TypedSheetAdjustment[] = [];
		for (const sheetAdjustment of sheetAdjustments) {
			// we have types of sheet adjustment group based on attribute
			// and then those attributes are grouped by type
			// the attributes are any of Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma or their shorthands
			// the type are any of skills, checks, dcs, or saves
			if (SheetUtils.sheetPropertyGroups.includes(_.camelCase(sheetAdjustment.property))) {
				// if we have a property group, we need to spread the adjustment across all of the properties in that group
				let splitValues = _.snakeCase(sheetAdjustment.property).split('_');
				let attribute: string | null = splitValues[0];
				let group: string | null = splitValues[1];
				if (!group && attribute) {
					// this is actually the case where we have the group but no attribute, but the split
					// only recognizes a single value, so it slots it into attribute
					group = attribute;
					attribute = null;
				}

				const attributeNames: string[] = [];
				// skills and saves are both types of checks, so we can double up
				if (group === 'checks' || group === 'skills') {
					if (!attribute || attribute === 'int' || attribute === 'intelligence') {
						attributeNames.push(
							'arcana',
							'crafting',
							'lores',
							'medicine',
							'occultism',
							'society'
						);
						if (sheet.additionalSkills.length) {
							attributeNames.push(
								...sheet.additionalSkills.map(lore => `${lore.name} lore`)
							);
						}
					}
					if (!attribute || attribute === 'wis' || attribute === 'wisdom') {
						attributeNames.push('medicine', 'nature', 'survival', 'religion');
					}
					if (!attribute || attribute === 'cha' || attribute === 'charisma') {
						attributeNames.push(
							'diplomacy',
							'intimidation',
							'performance',
							'deception'
						);
					}
					if (!attribute || attribute === 'str' || attribute === 'strength') {
						attributeNames.push('athletics');
					}
					if (!attribute || attribute === 'dex' || attribute === 'dexterity') {
						attributeNames.push('acrobatics', 'stealth', 'thievery');
					}
				}
				if (group === 'checks' || group === 'saves') {
					if (!attribute || attribute === 'wis' || attribute === 'wisdom') {
						attributeNames.push('will');
					}
					if (!attribute || attribute === 'con' || attribute === 'constitution') {
						attributeNames.push('fortitude');
					}
					if (!attribute || attribute === 'dex' || attribute === 'dexterity') {
						attributeNames.push('reflex');
					}
				}
				if (group === 'checks') {
					if (!attribute || attribute === 'wis' || attribute === 'wisdom') {
						attributeNames.push('perception');
					}
				}
				// we need to create a new sheet adjustment for each attribute
				for (const attributeName of attributeNames) {
					newSheetAdjustments.push({
						...sheetAdjustment,
						property: attributeName,
					});
				}
			} else {
				newSheetAdjustments.push(sheetAdjustment);
			}
		}
		return newSheetAdjustments;
	}
	static parseSheetModifiers(sheet: Sheet | Sheet, modifiers: Modifier[]) {
		const activeSheetModifiers: SheetModifier[] = modifiers
			.filter((modifier): modifier is SheetModifier => modifier.modifierType === 'sheet')
			.filter(modifier => modifier.isActive);

		const activeSheetAdjustments: TypedSheetAdjustment[] = activeSheetModifiers.reduce(
			(a, b) => {
				return a.concat(
					(b.sheetAdjustments ?? []).map(adjustment => ({
						...adjustment,
						property: SheetAdjuster.standardizeProperty(adjustment.property),
						type: b.type,
						propertyType: SheetAdjuster.getPropertyType(adjustment.property),
					}))
				);
			},
			[] as TypedSheetAdjustment[]
		);
		const spreadSheetAdjustments = SheetUtils.spreadSheetAdjustmentGroups(
			activeSheetAdjustments,
			sheet
		);

		/**
		 * Groups sheet adjustments by property and type, then combines anything that can be combined
		 * Spits out adjustments that can be applied directly to the sheet
		 */
		const sheetBucketer = new SheetAdjustmentBucketer();
		for (const adjustment of spreadSheetAdjustments) {
			sheetBucketer.addToBucket(adjustment);
		}
		return sheetBucketer.reduceBuckets();
	}
	static applySheetAdjustments(sheet: Sheet, sheetAdjustments: TypedSheetAdjustment[]): Sheet {
		const newSheet: Sheet = _.cloneDeep(sheet);

		const adjuster = new SheetAdjuster(newSheet);
		for (const adjustment of sheetAdjustments) {
			adjuster.adjust(adjustment);
		}
		return newSheet;
	}
	// // if it's a simple property overwrite
	// for (const property of allProperties) {
	// 	if (keyInSheetPropertyLocations(property)) {
	// 		adjuster.properties[property].adjust();
	// 		const location = sheetPropertyLocations[property] as keyof Sheet;
	// 		const baseValue =
	// 			overwriteSheetAdjustments[property] ?? newSheet[location][property] ?? 0;
	// 		const adjustBy = modifySheetAdjustments[property];

	// 		if (adjustBy) {
	// 			newSheet[location][property] = Number(baseValue) + Number(adjustBy);
	// 		} else {
	// 			newSheet[location][property] = baseValue;
	// 		}
	// 		continue;
	// 	}

	// 	// Special cases

	// 	// lores

	// 	const loreMatch = property.match(loreRegex);
	// 	if (loreMatch) {
	// 		const loreName = loreMatch[1];
	// 		const lore = newSheet.additionalSkills.find(lore => lore.name === loreName);
	// 		if (lore) {
	// 			const baseValue = overwriteSheetAdjustments[property] ?? lore.total ?? 0;
	// 			const adjustBy = modifySheetAdjustments[property];
	// 			if (adjustBy) {
	// 				lore.total = Number(baseValue) + Number(adjustBy);
	// 			} else {
	// 				lore.total = Number(baseValue);
	// 			}
	// 		}
	// 		continue;
	// 	}

	// 	// attacks
	// 	if (property === 'attack' || property === 'attacks') {
	// 		for (const attack in newSheet.attacks) {
	// 			const baseValue =
	// 				overwriteSheetAdjustments[property] ?? newSheet.attacks[attack].toHit ?? 0;
	// 			const adjustBy = modifySheetAdjustments[property] ?? 0;
	// 			newSheet.attacks[attack].toHit = Number(baseValue) + Number(adjustBy);
	// 		}
	// 		continue;
	// 	}

	// 		// resistances
	// 		const resistanceMatch = property.match(resistanceRegex);
	// 		if (resistanceMatch) {
	// 			const resistanceType = resistanceMatch[1];
	// 			let found = false;
	// 			for (const resistanceIndex in newSheet.defenses.resistances) {
	// 				if (newSheet.defenses.resistances[resistanceIndex].type === resistanceType) {
	// 					const baseValue =
	// 						overwriteSheetAdjustments[property] ??
	// 						sheet.defenses.resistances[resistanceIndex].amount ??
	// 						0;
	// 					const adjustBy = modifySheetAdjustments[property] ?? 0;
	// 					newSheet.defenses.resistances[resistanceIndex].amount =
	// 						Number(baseValue) + Number(adjustBy);
	// 					found = true;
	// 				}
	// 			}

	// 			if (!found) {
	// 				newSheet.defenses.resistances.push({
	// 					type: resistanceType,
	// 					amount:
	// 						Number(overwriteSheetAdjustments[property] ?? 0) +
	// 						Number(modifySheetAdjustments[property] ?? 0),
	// 				});
	// 			}
	// 			continue;
	// 		}

	// 		// weaknesses
	// 		const weaknessMatch = property.match(weaknessRegex);
	// 		if (weaknessMatch) {
	// 			const weaknessType = weaknessMatch[1];
	// 			let found = false;
	// 			for (const weaknessIndex in newSheet.defenses.weaknesses) {
	// 				if (newSheet.defenses.weaknesses[weaknessIndex].type === weaknessType) {
	// 					const baseValue =
	// 						overwriteSheetAdjustments[property] ??
	// 						newSheet.defenses.weaknesses[weaknessIndex].amount ??
	// 						0;
	// 					const adjustBy = modifySheetAdjustments[property] ?? 0;
	// 					newSheet.defenses.weaknesses[weaknessIndex].amount =
	// 						Number(baseValue) + Number(adjustBy);
	// 					found = true;
	// 				}
	// 			}

	// 			if (!found) {
	// 				newSheet.defenses.weaknesses.push({
	// 					type: weaknessType,
	// 					amount:
	// 						Number(overwriteSheetAdjustments[property] ?? 0) +
	// 						Number(modifySheetAdjustments[property] ?? 0),
	// 				});
	// 			}
	// 			continue;
	// 		}

	// 		// immunities
	// 		const immunityMatch = property.match(immunityRegex);
	// 		if (immunityMatch) {
	// 			const immunityType = immunityMatch[1];
	// 			const value =
	// 				overwriteSheetAdjustments[property] ?? modifySheetAdjustments[property];
	// 			if (value !== undefined) {
	// 				const activate =
	// 					(!isNaN(Number(value)) && Number(value) > 0) ||
	// 					!['no', 'false', 'null'].includes(String(value));
	// 				if (activate) {
	// 					newSheet.defenses.immunities.push(immunityType);
	// 					newSheet.defenses.immunities = _.uniq(newSheet.defenses.immunities);
	// 				} else {
	// 					newSheet.defenses.immunities = newSheet.defenses.immunities.filter(
	// 						immunity => immunity !== immunityType
	// 					);
	// 				}
	// 			}
	// 		}

	// 		// senses
	// 		const senseMatch = property.match(senseRegex);
	// 		if (senseMatch) {
	// 			const senseType = senseMatch[1];
	// 			const value =
	// 				overwriteSheetAdjustments[property] ?? modifySheetAdjustments[property];
	// 			if (value !== undefined) {
	// 				const activate =
	// 					(!isNaN(Number(value)) && Number(value) > 0) ||
	// 					(isNaN(Number(value)) && !['no', 'false', 'null'].includes(String(value)));
	// 				if (activate) {
	// 					newSheet.info.senses.push(senseType);
	// 					newSheet.info.senses = _.uniq(newSheet.info.senses);
	// 				} else {
	// 					newSheet.info.senses = newSheet.info.senses.filter(
	// 						sense => sense !== senseType
	// 					);
	// 				}
	// 			}
	// 		}

	// 		// languages
	// 		const languageMatch = property.match(languageRegex);
	// 		if (languageMatch) {
	// 			const languageType = languageMatch[1];
	// 			const value =
	// 				overwriteSheetAdjustments[property] ?? modifySheetAdjustments[property];
	// 			if (value !== undefined) {
	// 				const activate =
	// 					(!isNaN(Number(value)) && Number(value) > 0) ||
	// 					(isNaN(Number(value)) && !['no', 'false', 'null'].includes(String(value)));
	// 				if (activate) {
	// 					newSheet.info.languages.push(languageType);
	// 					newSheet.info.languages = _.uniq(newSheet.info.languages);
	// 				} else {
	// 					newSheet.info.languages = newSheet.info.languages.filter(
	// 						language => language !== languageType
	// 					);
	// 				}
	// 			}
	// 		}
	// 	}
	// 	return newSheet;
	// }

	static get sheetPropertyGroups() {
		return sheetPropertyGroups;
	}
}
