import _, { property } from 'lodash';
import { Character, Sheet } from '../services/kobold/models/index.js';

export const loreRegex = /(.*) lore$/;
export const immunityRegex = /([A-Za-z ]+) immunity/;
export const resistanceRegex = /([A-Za-z ]+) resistance/;
export const weaknessRegex = /([A-Za-z ]+) weakness/;
export const languageRegex = /([A-Za-z ]+) language/;
export const senseRegex = /([A-Za-z ]+) sense/;

export const numericSheetProperties = [
	'age',
	'strength',
	'dexterity',
	'constitution',
	'intelligence',
	'wisdom',
	'charisma',
	'speed',
	'flySpeed',
	'swimSpeed',
	'climbSpeed',
	'focusPoints',
	'classDC',
	'classAttack',
	'perception',
	'perceptionProfMod',
	'maxHp',
	'maxResolve',
	'maxStamina',
	'ac',
	'heavyProfMod',
	'mediumProfMod',
	'lightProfMod',
	'unarmoredProfMod',
	'arcaneAttack',
	'arcaneDC',
	'arcaneProfMod',
	'divineAttack',
	'divineDC',
	'divineProfMod',
	'occultAttack',
	'occultDC',
	'occultProfMod',
	'primalAttack',
	'primalDC',
	'primalProfMod',
	'fortitude',
	'fortitudeProfMod',
	'reflex',
	'reflexProfMod',
	'will',
	'willProfMod',
	'acrobatics',
	'acrobaticsProfMod',
	'arcana',
	'arcanaProfMod',
	'athletics',
	'athleticsProfMod',
	'crafting',
	'craftingProfMod',
	'deception',
	'deceptionProfMod',
	'diplomacy',
	'diplomacyProfMod',
	'intimidation',
	'intimidationProfMod',
	'medicine',
	'medicineProfMod',
	'nature',
	'natureProfMod',
	'occultism',
	'occultismProfMod',
	'performance',
	'performanceProfMod',
	'religion',
	'religionProfMod',
	'society',
	'societyProfMod',
	'stealth',
	'stealthProfMod',
	'survival',
	'survivalProfMod',
	'thievery',
	'thieveryProfMod',
];

export const sheetPropertyLocations = {
	name: 'info',
	url: 'info',
	description: 'info',
	gender: 'info',
	age: 'info',
	alignment: 'info',
	deity: 'info',
	imageURL: 'info',
	size: 'info',

	strength: 'abilities',
	dexterity: 'abilities',
	constitution: 'abilities',
	intelligence: 'abilities',
	wisdom: 'abilities',
	charisma: 'abilities',

	speed: 'general',
	flySpeed: 'general',
	swimSpeed: 'general',
	climbSpeed: 'general',
	focusPoints: 'general',
	classDC: 'general',
	classAttack: 'general',
	perception: 'general',
	perceptionProfMod: 'general',

	maxHp: 'defenses',
	maxResolve: 'defenses',
	maxStamina: 'defenses',
	ac: 'defenses',
	heavyProfMod: 'defenses',
	mediumProfMod: 'defenses',
	lightProfMod: 'defenses',
	unarmoredProfMod: 'defenses',

	arcaneAttack: 'castingStats',
	arcaneDC: 'castingStats',
	arcaneProfMod: 'castingStats',
	divineAttack: 'castingStats',
	divineDC: 'castingStats',
	divineProfMod: 'castingStats',
	occultAttack: 'castingStats',
	occultDC: 'castingStats',
	occultProfMod: 'castingStats',
	primalAttack: 'castingStats',
	primalDC: 'castingStats',
	primalProfMod: 'castingStats',

	fortitude: 'saves',
	fortitudeProfMod: 'saves',
	reflex: 'saves',
	reflexProfMod: 'saves',
	will: 'saves',
	willProfMod: 'saves',

	acrobatics: 'skills',
	acrobaticsProfMod: 'skills',
	arcana: 'skills',
	arcanaProfMod: 'skills',
	athletics: 'skills',
	athleticsProfMod: 'skills',
	crafting: 'skills',
	craftingProfMod: 'skills',
	deception: 'skills',
	deceptionProfMod: 'skills',
	diplomacy: 'skills',
	diplomacyProfMod: 'skills',
	intimidation: 'skills',
	intimidationProfMod: 'skills',
	medicine: 'skills',
	medicineProfMod: 'skills',
	nature: 'skills',
	natureProfMod: 'skills',
	occultism: 'skills',
	occultismProfMod: 'skills',
	performance: 'skills',
	performanceProfMod: 'skills',
	religion: 'skills',
	religionProfMod: 'skills',
	society: 'skills',
	societyProfMod: 'skills',
	stealth: 'skills',
	stealthProfMod: 'skills',
	survival: 'skills',
	survivalProfMod: 'skills',
	thievery: 'skills',
	thieveryProfMod: 'skills',
};

export const sheetPropertyPseudonyms = {
	imageurl: 'imageURL',
	image: 'imageURL',
	avatar: 'imageURL',
	avatarurl: 'imageURL',

	fly: 'flySpeed',
	climb: 'climbSpeed',
	swim: 'swimSpeed',

	totalfocuspoints: 'focusPoints',
	maxfocuspoints: 'focusPoints',

	hp: 'maxHp',
	maxhp: 'maxHp',
	hitpoints: 'maxHp',
	totalhp: 'maxHp',

	armor: 'ac',
	ac: 'ac',
	armorclass: 'ac',

	classdc: 'classDC',
	classattack: 'classAttack',

	arcanedc: 'arcaneDC',
	arcaneattack: 'arcaneAttack',
	occultdc: 'occultDC',
	occultattack: 'occultAttack',
	primaldc: 'primalDC',
	primalattack: 'primalAttack',
	divinedc: 'divineDC',
	divineattack: 'divineAttack',

	fort: 'fortitude',
	ref: 'reflex',
	fortitudesave: 'fortitude',
	reflexsave: 'reflex',
	willsave: 'will',
	fortsave: 'fortitude',
	refsave: 'reflex',
};

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
export type typedSheetAdjustment = Character['modifiers'][0]['sheetAdjustments'][0] & {
	type: string;
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
	public static defaultSheet = {
		info: { traits: [] },
		general: { senses: [], languages: [] },
		abilities: {},
		defenses: { resistances: [], immunities: [], weaknesses: [] },
		offense: {},
		castingStats: {},
		saves: {},
		skills: { lores: [] },
		attacks: [],
		rollMacros: [],
		actions: [],
		modifiers: [],
		sourceData: {},
	};

	// we aren't validating, so we default to returning the property if we can't apply the pseudonym
	static standardizeSheetProperty(property: string): string {
		let camelCaseCheck = _.camelCase(property);
		if (sheetPropertyLocations[camelCaseCheck] !== undefined) return camelCaseCheck;

		let lowerCaseCheck = property
			.toLowerCase()
			.replaceAll(' ', '')
			.replaceAll('_', '')
			.replaceAll('-', '');
		if (sheetPropertyLocations[lowerCaseCheck] !== undefined) return lowerCaseCheck;

		if (sheetPropertyPseudonyms[lowerCaseCheck] !== undefined)
			return sheetPropertyPseudonyms[lowerCaseCheck];

		return property;
	}

	static validateSheetProperty(property: string): boolean {
		// basic sheet property
		if (sheetPropertyLocations[SheetUtils.standardizeSheetProperty(property)] !== undefined)
			return true;
		// property groups
		if (sheetPropertyGroups.includes(_.camelCase(property))) return true;
		// extra properties
		if (['attacks', 'attack'].includes(property)) return true;
		// regexes
		if (
			property.match(loreRegex) ||
			property.match(immunityRegex) ||
			property.match(resistanceRegex) ||
			property.match(weaknessRegex) ||
			property.match(languageRegex) ||
			property.match(senseRegex)
		)
			return true;

		return false;
	}

	static sheetPropertyIsNumeric(property: string): boolean {
		if (sheetPropertyGroups.includes(_.camelCase(property))) return true;
		if (numericSheetProperties.includes(SheetUtils.standardizeSheetProperty(property)))
			return true;
		if (['attacks', 'attack'].includes(property)) return true;
		if (
			property.match(loreRegex) ||
			property.match(resistanceRegex) ||
			property.match(weaknessRegex)
		)
			return true;
		return false;
	}

	/**
	 * Applies the value of a modifier to the target property
	 */
	static applySheetAdjustmentToProperty(
		property: string | number,
		modifier: Character['modifiers'][0]['sheetAdjustments'][0]
	) {
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

	static bucketSheetAdjustmentsByType(typedSheetAdjustments: typedSheetAdjustment[]) {
		const positiveTypedSheetAdjustments: reducedSheetAdjustment = {};
		const negativeTypedSheetAdjustments: reducedSheetAdjustment = {};
		const overwriteSheetAdjustments: untypedAdjustment = {};

		for (const sheetAdjustment of typedSheetAdjustments) {
			// if the operation is "=", we just overwrite the value
			if (sheetAdjustment.operation === '=') {
				overwriteSheetAdjustments[sheetAdjustment.property] = sheetAdjustment.value;
				continue;
			}

			let typedSheetAdjustments =
				sheetAdjustment.operation === '+'
					? positiveTypedSheetAdjustments
					: negativeTypedSheetAdjustments;

			const adjustmentType = sheetAdjustment.type;
			const targetProperty = sheetAdjustment.property;

			// Sign the value
			const newValue = sheetAdjustment.operation + sheetAdjustment.value;

			if (typedSheetAdjustments[targetProperty] === undefined) {
				typedSheetAdjustments[targetProperty] = {};
			}
			const currentValue = typedSheetAdjustments[targetProperty][adjustmentType] ?? 0;

			if (!currentValue) {
				// if we don't already have a value in place, we just overwrite
				typedSheetAdjustments[targetProperty][adjustmentType] = newValue;
			} else if (currentValue !== undefined) {
				// if we've already adjusted this property, we need to combine the sheetAdjustments based on the type / operation
				if (['untyped', 'none', 'null', ''].includes(adjustmentType) || !adjustmentType) {
					// untyped adjustments all stack with one another
					typedSheetAdjustments[targetProperty][adjustmentType] =
						Number(currentValue) + Number(newValue);
				} else {
					// other types take the max positive value and the min negative value of each adjustment
					if (sheetAdjustment.operation === '+') {
						// max
						typedSheetAdjustments[targetProperty][adjustmentType] = Math.max(
							Number(currentValue),
							Number(newValue)
						);
					} else {
						// min
						typedSheetAdjustments[targetProperty][adjustmentType] = Math.min(
							Number(currentValue),
							Number(newValue)
						);
					}
				}
			}
		}
		return {
			positiveTypedSheetAdjustments,
			negativeTypedSheetAdjustments,
			overwriteSheetAdjustments,
		};
	}
	static reduceSheetAdjustmentsByType(
		positiveTypedSheetAdjustments: reducedSheetAdjustment,
		negativeTypedSheetAdjustments: reducedSheetAdjustment,
		overwriteSheetAdjustments: untypedAdjustment
	) {
		//now join the three types. Start with the positive value. Subtract the negative if needed. Then overwrite if necessary.
		const modifySheetAdjustments: {
			[property: string]: string | number;
		} = {};
		const allProperties = _.uniq(
			Object.keys(positiveTypedSheetAdjustments).concat(
				Object.keys(negativeTypedSheetAdjustments)
			)
		);

		for (const property of allProperties) {
			modifySheetAdjustments[property] = 0;
			if (positiveTypedSheetAdjustments[property] !== undefined) {
				const summedPositiveAdjustments = Object.values(
					positiveTypedSheetAdjustments[property]
				).reduce((a, b) => Number(a) + Number(b), 0);
				modifySheetAdjustments[property] =
					Number(modifySheetAdjustments[property]) + Number(summedPositiveAdjustments);
			}
			if (negativeTypedSheetAdjustments[property] !== undefined) {
				const summedNegativeAdjustments = Object.values(
					negativeTypedSheetAdjustments[property]
				).reduce((a, b) => Number(a) + Number(b), 0);
				modifySheetAdjustments[property] =
					Number(modifySheetAdjustments[property]) + Number(summedNegativeAdjustments);
			}
		}
		return { modifySheetAdjustments, overwriteSheetAdjustments };
	}
	static spreadSheetAdjustmentGroups(sheetAdjustments: typedSheetAdjustment[], sheet: Sheet) {
		const newSheetAdjustments: typedSheetAdjustment[] = [];
		for (const sheetAdjustment of sheetAdjustments) {
			// we have types of sheet adjustment group based on attribute
			// and then those attributes are grouped by type
			// the attributes are any of Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma or their shorthands
			// the type are any of skills, checks, dcs, or saves
			if (SheetUtils.sheetPropertyGroups.includes(_.camelCase(sheetAdjustment.property))) {
				// if we have a property group, we need to spread the adjustment across all of the properties in that group
				let [attribute, group] = _.snakeCase(sheetAdjustment.property).split('_');
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
						if (sheet.skills.lores.length) {
							attributeNames.push(
								...sheet.skills.lores.map(lore => `${lore.name} lore`)
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
	static parseSheetModifiers(sheet: Sheet, modifiers: Character['modifiers']) {
		const activeSheetModifiers = modifiers.filter(
			modifier => modifier.isActive && modifier.modifierType === 'sheet'
		);
		const activeSheetAdjustments: typedSheetAdjustment[] = activeSheetModifiers.reduce(
			(a, b) => {
				return a.concat(
					b.sheetAdjustments.map(adjustment => ({
						...adjustment,
						property: SheetUtils.standardizeSheetProperty(adjustment.property),
						type: b.type,
					}))
				);
			},
			[]
		);
		const spreadSheetAdjustments = SheetUtils.spreadSheetAdjustmentGroups(
			activeSheetAdjustments,
			sheet
		);
		const standardizedSheetAdjustments = _.map(
			spreadSheetAdjustments,
			(adjustment: typedSheetAdjustment) => ({
				...adjustment,
				property: SheetUtils.standardizeSheetProperty(adjustment.property),
			})
		);
		const bucketedSheetAdjustments = SheetUtils.bucketSheetAdjustmentsByType(
			standardizedSheetAdjustments
		);
		const { modifySheetAdjustments, overwriteSheetAdjustments } =
			SheetUtils.reduceSheetAdjustmentsByType(
				bucketedSheetAdjustments.positiveTypedSheetAdjustments,
				bucketedSheetAdjustments.negativeTypedSheetAdjustments,
				bucketedSheetAdjustments.overwriteSheetAdjustments
			);
		return { modifySheetAdjustments, overwriteSheetAdjustments };
	}
	static applySheetAdjustments(
		sheet: Sheet,
		overwriteSheetAdjustments: untypedAdjustment,
		modifySheetAdjustments: untypedAdjustment
	): Sheet {
		const newSheet = _.cloneDeep(sheet);
		const allProperties = _.uniq(
			Object.keys(overwriteSheetAdjustments).concat(Object.keys(modifySheetAdjustments))
		);

		// if it's a simple property overwrite
		for (const property of allProperties) {
			if (sheetPropertyLocations[property] !== undefined) {
				const location = sheetPropertyLocations[property];
				const baseValue =
					overwriteSheetAdjustments[property] ?? newSheet[location][property] ?? 0;
				const adjustBy = modifySheetAdjustments[property];

				if (adjustBy) {
					newSheet[location][property] = Number(baseValue) + Number(adjustBy);
				} else {
					newSheet[location][property] = baseValue;
				}
				continue;
			}

			// Special cases

			// lores

			const loreMatch = property.match(loreRegex);
			if (loreMatch) {
				const loreName = loreMatch[1];
				const lore = newSheet.skills.lores.find(lore => lore.name === loreName);
				if (lore) {
					const baseValue = overwriteSheetAdjustments[property] ?? lore.bonus ?? 0;
					const adjustBy = modifySheetAdjustments[property];
					if (adjustBy) {
						lore.bonus = Number(baseValue) + Number(adjustBy);
					} else {
						lore.bonus = Number(baseValue);
					}
				}
				continue;
			}

			// attacks
			if (property === 'attack' || property === 'attacks') {
				for (const attack in newSheet.attacks) {
					const baseValue =
						overwriteSheetAdjustments[property] ?? newSheet.attacks[attack].toHit ?? 0;
					const adjustBy = modifySheetAdjustments[property] ?? 0;
					newSheet.attacks[attack].toHit = Number(baseValue) + Number(adjustBy);
				}
				continue;
			}

			// resistances
			if (property.match(resistanceRegex)) {
				const resistanceType = property.match(resistanceRegex)[1];
				let found = false;
				for (const resistanceIndex in newSheet.defenses.resistances) {
					if (newSheet.defenses.resistances[resistanceIndex].name === resistanceType) {
						const baseValue =
							overwriteSheetAdjustments[property] ??
							sheet.defenses.resistances[resistanceIndex].amount ??
							0;
						const adjustBy = modifySheetAdjustments[property] ?? 0;
						newSheet.defenses.resistances[resistanceIndex].amount =
							Number(baseValue) + Number(adjustBy);
						found = true;
					}
				}

				if (!found) {
					newSheet.defenses.resistances.push({
						name: resistanceType,
						amount:
							Number(overwriteSheetAdjustments[property] ?? 0) +
							Number(modifySheetAdjustments[property] ?? 0),
					});
				}
				continue;
			}

			// weaknesses
			if (property.match(weaknessRegex)) {
				const weaknessType = property.match(weaknessRegex)[1];
				let found = false;
				for (const weaknessIndex in newSheet.defenses.weaknesses) {
					if (newSheet.defenses.weaknesses[weaknessIndex].name === weaknessType) {
						const baseValue =
							overwriteSheetAdjustments[property] ??
							newSheet.defenses.weaknesses[weaknessIndex].amount ??
							0;
						const adjustBy = modifySheetAdjustments[property] ?? 0;
						newSheet.defenses.weaknesses[weaknessIndex].amount =
							Number(baseValue) + Number(adjustBy);
						found = true;
					}
				}

				if (!found) {
					newSheet.defenses.weaknesses.push({
						name: weaknessType,
						amount:
							Number(overwriteSheetAdjustments[property] ?? 0) +
							Number(modifySheetAdjustments[property] ?? 0),
					});
				}
				continue;
			}

			// immunities
			if (property.match(immunityRegex)) {
				const immunityType = property.match(immunityRegex)[1];
				const value =
					overwriteSheetAdjustments[property] ?? modifySheetAdjustments[property];
				if (value !== undefined) {
					const activate =
						(!isNaN(Number(value)) && Number(value) > 0) ||
						!['no', 'false', 'null'].includes(String(value));
					if (activate) {
						newSheet.defenses.immunities.push(immunityType);
						newSheet.defenses.immunities = _.uniq(newSheet.defenses.immunities);
					} else {
						newSheet.defenses.immunities = newSheet.defenses.immunities.filter(
							immunity => immunity !== immunityType
						);
					}
				}
			}

			// senses
			if (property.match(senseRegex)) {
				const senseType = property.match(senseRegex)[1];
				const value =
					overwriteSheetAdjustments[property] ?? modifySheetAdjustments[property];
				if (value !== undefined) {
					const activate =
						(!isNaN(Number(value)) && Number(value) > 0) ||
						(isNaN(Number(value)) && !['no', 'false', 'null'].includes(String(value)));
					if (activate) {
						newSheet.general.senses.push(senseType);
						newSheet.general.senses = _.uniq(newSheet.general.senses);
					} else {
						newSheet.general.senses = newSheet.general.senses.filter(
							sense => sense !== senseType
						);
					}
				}
			}

			// languages
			if (property.match(languageRegex)) {
				const languageType = property.match(languageRegex)[1];
				const value =
					overwriteSheetAdjustments[property] ?? modifySheetAdjustments[property];
				if (value !== undefined) {
					const activate =
						(!isNaN(Number(value)) && Number(value) > 0) ||
						(isNaN(Number(value)) && !['no', 'false', 'null'].includes(String(value)));
					if (activate) {
						newSheet.general.languages.push(languageType);
						newSheet.general.languages = _.uniq(newSheet.general.languages);
					} else {
						newSheet.general.languages = newSheet.general.languages.filter(
							language => language !== languageType
						);
					}
				}
			}
		}
		return newSheet;
	}

	static get sheetPropertyGroups() {
		return sheetPropertyGroups;
	}
}
