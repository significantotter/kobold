import _, { property } from 'lodash';
import {
	Modifier,
	SheetAdjustment,
	Sheet,
	SheetModifier,
	Character,
	SheetAdjustmentOperationEnum,
	SheetAdjustmentTypeEnum,
} from '../services/kobold/models/index.js';
import { SheetAdjuster } from './sheet-adjuster.js';
import { SheetAdjustmentBucketer } from './sheet-adjustment-bucketer.js';
import { Creature } from './creature.js';
import { KoboldError } from './KoboldError.js';
import { SheetProperties } from './sheet-properties.js';

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

export type reducedSheetAdjustment = {
	[type: string]: {
		[property: string]: string | number;
	};
};
export type untypedAdjustment = {
	[property: string]: string | number;
};

export class SheetUtils {
	public static adjustSheetWithModifiers(sheet: Sheet, modifiers: Modifier[]) {
		const activeSheetModifiers: SheetModifier[] = modifiers
			.filter((modifier): modifier is SheetModifier => modifier.modifierType === 'sheet')
			.filter(modifier => modifier.isActive);

		return this.adjustSheetWithSheetAdjustments(
			sheet,
			activeSheetModifiers.flatMap(modifier => modifier.sheetAdjustments)
		);
	}

	public static adjustSheetWithSheetAdjustments(
		sheet: Sheet,
		sheetAdjustments: SheetAdjustment[]
	) {
		const bucketer = new SheetAdjustmentBucketer(sheet);
		for (const adjustment of sheetAdjustments) {
			// standardize the property
			const standardizedProperty = SheetAdjuster.standardizeProperty(adjustment.property);
			if (SheetProperties.isPropertyGroup(standardizedProperty)) {
				// split the adjustment into many property adjustments if it's a group
				const properties = SheetProperties.propertyGroupToSheetProperties(
					sheet,
					standardizedProperty
				);
				const spreadAdjustments = properties.map(property => ({
					...adjustment,
					property,
				}));

				// add each adjustment to the bucketer
				for (const spreadAdjustment of spreadAdjustments) {
					bucketer.addToBucket(spreadAdjustment);
				}
			} else {
				// otherwise add the adjustment to the bucketer
				bucketer.addToBucket({ ...adjustment, property: standardizedProperty });
			}
		}

		const simplifiedAdjustments = bucketer.reduceBuckets();

		const adjustedSheet = _.cloneDeep(sheet);
		const adjuster = new SheetAdjuster(adjustedSheet);
		for (const adjustment of simplifiedAdjustments) {
			adjuster.adjust(adjustment);
		}
		return adjustedSheet;
	}

	public static sheetModifiersFromString(input: string, creature: Creature): SheetModifier[] {
		const adjustmentStrings = input.split(';').filter(result => result.trim() !== '');
		if (!adjustmentStrings.length) {
			throw new KoboldError("Yip! I didn't find any modifiers in what you sent me!");
		}
		return adjustmentStrings.map(adjustmentStrings =>
			this.sheetAdjustmentFromString(adjustmentStrings, creature)
		);
	}
	public static sheetAdjustmentFromString(input: string, creature: Creature): SheetAdjustment {
		const modifierRegex = /([A-Za-z _-]+)\s*([\+\-\=])\s*(.+)/g;
		const match = modifierRegex.exec(modifier);
		if (!match) {
			throw new KoboldError(
				`Yip! I couldn't understand the modifier "${input}". Modifiers must be ` +
					`in the format "Attribute Name + 1; Other Attribute - 1;final attribute = 1". Spaces are optional.`
			);
		}
		let [, attributeName, operator, value] = match.map(result => result.trim());

		const standardizedProperty = SheetAdjuster.standardizeProperty(attributeName);
		// validate each result
		// attributeName must be a valid sheet property
		if (!SheetAdjuster.validateSheetProperty(attributeName)) {
			throw new KoboldError(
				`Yip! I couldn't find a sheet attribute named "${attributeName}".`
			);
		}
		// operator must be +, -, or =
		if (operator in SheetAdjustmentOperationEnum) {
			throw new KoboldError(
				`Yip! I couldn't understand the operator "${operator}". Operators must be +, -, or =.`
			);
		}
		const propertyType = SheetAdjuster.getPropertyType(attributeName);

		// value must be a number if it's a numeric value
		if (SheetProperties.sheetPropertyIsNumeric(attributeName) && isNaN(Number(value))) {
			throw new KoboldError(
				`Yip! ${attributeName} "${value}" couldn't be converted to a number.`
			);
		}
		return {
			type: SheetAdjustmentTypeEnum.untyped,
			propertyType: propertyType,
			property: attributeName,
			operation: operator as SheetAdjustmentOperationEnum,
			value: value,
		};
	}
}
