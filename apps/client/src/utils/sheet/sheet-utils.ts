import _ from 'lodash';
import {
	Modifier,
	Sheet,
	SheetAdjustment,
	SheetAdjustmentOperationEnum,
	SheetAdjustmentTypeEnum,
	getDefaultSheet,
} from '@kobold/db';
import { KoboldError } from '../KoboldError.js';
import { SheetAdjuster } from './sheet-adjuster.js';
import { SheetAdjustmentBucketer } from './sheet-adjustment-bucketer.js';
import { SheetProperties } from './sheet-properties.js';
import { ModifierUtils } from '../kobold-service-utils/modifier-utils.js';

export class SheetUtils {
	public static adjustSheetWithModifiers(sheet: Sheet, modifiers: Modifier[]) {
		const activeSheetModifiers: Modifier[] = modifiers
			.filter((modifier): modifier is Modifier => modifier.sheetAdjustments.length > 0)
			.filter(modifier => modifier.isActive);

		const severityAppliedActiveModifiers = activeSheetModifiers.map(
			ModifierUtils.getSeverityAppliedModifier
		);
		return this.adjustSheetWithSheetAdjustments(
			sheet,
			severityAppliedActiveModifiers.flatMap(modifier => modifier.sheetAdjustments)
		);
	}
	public static stringToSheetAdjustments(
		input: string,
		type: SheetAdjustmentTypeEnum
	): SheetAdjustment[] {
		const adjustmentSegments = input.split(';').filter(result => result.trim() !== '');
		const sheetAdjustments = adjustmentSegments.flatMap(segment => {
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
			const standardizedProperty = SheetProperties.standardizeProperty(attributeName);
			const sheetAdjustment: SheetAdjustment = {
				type,
				propertyType: SheetAdjuster.getPropertyType(standardizedProperty),
				property: standardizedProperty,
				operation: operator as SheetAdjustmentOperationEnum,
				value: value,
			};

			//TODO we should just allow some attributes in sheet modifiers.
			if (
				!SheetAdjuster.validateSheetAdjustment({
					...sheetAdjustment,
					value: sheetAdjustment.value.replaceAll(ModifierUtils.severityRegex, '1'),
				})
			) {
				throw new KoboldError(`Yip! I couldn't understand the adjustment "${segment}".`);
			}

			return sheetAdjustment;
		});
		return sheetAdjustments;
	}

	public static adjustSheetWithSheetAdjustments(
		sheet: Sheet,
		sheetAdjustments: SheetAdjustment[]
	) {
		const bucketer = new SheetAdjustmentBucketer(sheet);
		for (const adjustment of sheetAdjustments) {
			// standardize the property
			const standardizedProperty = SheetProperties.standardizeProperty(adjustment.property);
			if (SheetProperties.isPropertyGroup(standardizedProperty)) {
				// split the adjustment into many property adjustments if it's a group
				const properties = SheetProperties.propertyGroupToSheetProperties(
					standardizedProperty,
					sheet
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
}
