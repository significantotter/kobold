import _ from 'lodash';
import {
	Modifier,
	SheetAdjustment,
	Sheet,
	SheetModifier,
	SheetAdjustmentOperationEnum,
	SheetAdjustmentTypeEnum,
	ModelWithSheet,
	SheetBaseCounterKeys,
} from '../../services/kobold/index.js';
import { SheetAdjuster } from './sheet-adjuster.js';
import { SheetAdjustmentBucketer } from './sheet-adjustment-bucketer.js';
import { KoboldError } from '../KoboldError.js';
import { SheetProperties } from './sheet-properties.js';
import { ChatInputCommandInteraction } from 'discord.js';
import { Creature } from '../creature.js';

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

	public static stringToSheetAdjustments(input: string): SheetAdjustment[] {
		const adjustmentSegments = input.split(';').filter(result => result.trim() !== '');
		const adjustments = adjustmentSegments.map(segment => {
			const adjustmentParts = /([^=+-]+)([=+-])(.+)/.exec(segment);
			if (!adjustmentParts) {
				throw new KoboldError(
					`Yip! I couldn't understand the modifier "${segment}". Modifiers must be ` +
						`in the format "Attribute Name +/-/= Attribute Adjustment", split with ";".`
				);
			}
			const [, attributeName, operator, value] = adjustmentParts.map(result => result.trim());
			if (!SheetAdjuster.validateSheetProperty(attributeName)) {
				throw new KoboldError(
					`Yip! I couldn't find an adjustable sheet attribute named "${attributeName}".`
				);
			}
			const standardizedProperty = SheetAdjuster.standardizeProperty(attributeName);
			const sheetAdjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				propertyType: SheetAdjuster.getPropertyType(standardizedProperty),
				property: standardizedProperty,
				operation: operator as SheetAdjustmentOperationEnum,
				value: value,
			};
			if (!SheetAdjuster.validateSheetAdjustment(sheetAdjustment)) {
				throw new KoboldError(`Yip! I couldn't understand the adjustment "${segment}".`);
			}
			return sheetAdjustment;
		});
		return adjustments;
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
					propertyType: SheetAdjuster.getPropertyType(property),
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

	public static async recoverGameplayStats(
		intr: ChatInputCommandInteraction,
		targets: ModelWithSheet[]
	) {
		const creature = targets[0]?.sheet ? new Creature(targets[0]?.sheet) : undefined;
		let recoverValues: ReturnType<Creature['recover']>;
		if (creature) {
			recoverValues = creature.recover();
		} else throw new KoboldError("Yip! I couldn't find a sheet to target.");
		await targets[0].saveSheet(intr, creature.sheet);
		return recoverValues;
	}
	public static async setGameplayStats(
		intr: ChatInputCommandInteraction,
		targets: ModelWithSheet[],
		option: SheetBaseCounterKeys,
		value: string
	) {
		// sheets should be exact duplicates, so we only do our updates on one sheet, but write it onto both locations
		const creature = targets[0]?.sheet ? new Creature(targets[0]?.sheet) : undefined;
		let updateValues: ReturnType<Creature['updateValue']>;
		if (creature) {
			updateValues = creature.updateValue(option, value);
		} else throw new KoboldError("Yip! I couldn't find a sheet to target.");
		await targets[0].saveSheet(intr, creature.sheet);
		return updateValues;
	}
}
