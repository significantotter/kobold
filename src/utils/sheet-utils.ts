import { Character, Sheet } from '../services/kobold/models/index.js';

type typedSheetAdjustment = Character['modifiers'][0]['sheetAdjustments'][0] & { type: string };

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
	public static typedSheet = {};

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
	static reduceSheetAdjustmentsByType(typedSheetAdjustments: typedSheetAdjustment[]) {
		const positiveTypedSheetAdjustments: {
			[type: string]: {
				[property: string]: string | number;
			};
		} = {};
		const negativeTypedSheetAdjustments: {
			[type: string]: {
				[property: string]: string | number;
			};
		} = {};
		const overwriteSheetAdjustments: {
			[type: string]: {
				[property: string]: string | number;
			};
		} = {};
		for (const sheetAdjustment of typedSheetAdjustments) {
			let typedSheetAdjustments =
				sheetAdjustment.operation === '='
					? overwriteSheetAdjustments
					: sheetAdjustment.operation === '+'
					? positiveTypedSheetAdjustments
					: negativeTypedSheetAdjustments;

			const adjustmentType = sheetAdjustment.type;
			const targetProperty = sheetAdjustment.property;
			const newValue = sheetAdjustment.value;

			if (typedSheetAdjustments[adjustmentType] === undefined) {
				typedSheetAdjustments[adjustmentType] = {};
			}
			const currentValue = typedSheetAdjustments[adjustmentType][targetProperty] ?? 0;
			if (sheetAdjustment.operation === '=' || !currentValue) {
				// overwrites always overwrite no matter the current value, type, etc.
				// alternatively, if we don't already have a value in place, we just overwrite
				typedSheetAdjustments[adjustmentType][targetProperty] = newValue;
			} else if (currentValue !== undefined) {
				// if we've already adjusted this property, we need to combine the sheetAdjustments based on the type / operation
				if (['untyped', 'none', 'null'].includes(adjustmentType) || !adjustmentType) {
					// untyped adjustments all stack with one another
					if (sheetAdjustment.operation === '+') {
						typedSheetAdjustments[adjustmentType][targetProperty] =
							Number(currentValue) + Number(newValue);
					} else if (sheetAdjustment.operation === '-') {
						typedSheetAdjustments[adjustmentType][targetProperty] =
							Number(currentValue) - Number(newValue);
					}
				} else {
					// other types take the max positive value and the min negative value of each adjustment
					if (sheetAdjustment.operation === '+') {
						// max
						typedSheetAdjustments[adjustmentType][targetProperty] = Math.max(
							Number(currentValue),
							Number(newValue)
						);
					} else {
						// min
						typedSheetAdjustments[adjustmentType][targetProperty] = Math.min(
							Number(currentValue),
							Number(newValue)
						);
					}
				}
			}
		}
		//now join the three types. Start with the positive value. Subtract the negative if needed. Then overwrite if necessary.
		const reducedSheetAdjustments: {
			[property: string]: string | number;
		} = {};
		for (const type in positiveTypedSheetAdjustments) {
			for (const property in positiveTypedSheetAdjustments[type]) {
				if (reducedSheetAdjustments[property] === undefined)
					reducedSheetAdjustments[property] = 0;
				reducedSheetAdjustments[property] =
					Number(reducedSheetAdjustments[property]) +
					Number(positiveTypedSheetAdjustments[type][property]);
			}
		}
		for (const type in negativeTypedSheetAdjustments) {
			for (const property in negativeTypedSheetAdjustments[type]) {
				if (reducedSheetAdjustments[property] === undefined)
					reducedSheetAdjustments[property] = 0;
				reducedSheetAdjustments[property] =
					Number(reducedSheetAdjustments[property]) -
					Number(negativeTypedSheetAdjustments[type][property]);
			}
		}
		for (const type in overwriteSheetAdjustments) {
			for (const property in overwriteSheetAdjustments[type]) {
				if (reducedSheetAdjustments[property] === undefined)
					reducedSheetAdjustments[property] = 0;
				reducedSheetAdjustments[property] = overwriteSheetAdjustments[type][property];
			}
		}
		return reducedSheetAdjustments;
	}
	static typeAndFlattenSheetAdjustmentsFromModifiers(modifiers: Character['modifiers']) {
		const typedSheetAdjustments: typedSheetAdjustment[] = [];
		for (const modifier of modifiers) {
			if (modifier.modifierType === 'sheet') {
				for (const sheetAdjustment of modifier.sheetAdjustments) {
					typedSheetAdjustments.push({
						...sheetAdjustment,
						type: modifier.type,
					});
				}
			}
		}
		return typedSheetAdjustments;
	}
	static spreadSheetAdjustmentGroups(sheetAdjustments: typedSheetAdjustment[]) {
		// we have types of sheet adjustment group based on attribute
		// and then those attributes are grouped by type
		// the attributes are any of Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma or their shorthands
		// the type are any of skills, checks, dcs, or saves
	}
	static applySheetModifier(sheet: Sheet, modifier: Character['modifiers'][0]) {}
}
