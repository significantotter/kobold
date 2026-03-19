import _ from 'lodash';
import { Dice } from 'dice-typescript';
import {
	AdjustablePropertyEnum,
	Condition,
	Sheet,
	SheetAdjustment,
	SheetAdjustmentOperationEnum,
	SheetAdjustmentTypeEnum,
} from '@kobold/db';
import { KoboldError } from '../KoboldError.js';
import { SheetAdjuster } from './sheet-adjuster.js';
import { SheetAdjustmentBucketer } from './sheet-adjustment-bucketer.js';
import { SheetProperties } from './sheet-properties.js';
import { ModifierUtils } from '../kobold-service-utils/modifier-utils.js';
import { AttributeUtils } from '../attribute-utils.js';

// Regex to match bracket references like [level], [strength], etc.
const attributeRegex = /(\[[\w \-_\.]{2,}\])/g;

export class SheetUtils {
	/**
	 * Parses bracket references (like [level], [strength]) from a string value using sheet data.
	 * Returns the expression with bracket references replaced by their numeric values.
	 * Uses AttributeUtils.getAttributeValueFromSheet for consistent attribute resolution.
	 */
	public static parseSheetReferences(value: string, sheet: Sheet): string {
		const splitExpression = value.split(attributeRegex);
		let finalExpression = '';

		for (const token of splitExpression) {
			if (attributeRegex.test(token)) {
				// Remove brackets to get the attribute name
				const attributeName = token.replace(/[\[\]]/g, '').trim();

				// Use the shared helper to resolve the attribute value
				const attributeValue = AttributeUtils.getAttributeValueFromSheet(
					sheet,
					attributeName
				);

				if (attributeValue !== null) {
					// Wrap negative values in parentheses for proper math evaluation
					finalExpression += attributeValue < 0 ? `(${attributeValue})` : attributeValue;
				} else {
					// If we couldn't resolve the reference, replace with 0
					finalExpression += '0';
				}
			} else {
				finalExpression += token;
			}
		}

		return finalExpression;
	}

	/**
	 * Evaluates a math expression string and returns the integer result.
	 * Uses the dice library to evaluate expressions like "5+3" or "(10-2)*2".
	 */
	public static evaluateMathExpression(expression: string): number {
		try {
			const dice = new Dice(undefined, undefined, {
				maxRollTimes: 1,
				maxDiceSides: 1,
			});
			const result = dice.roll(expression);
			if (result.errors?.length) {
				return parseInt(expression) || 0;
			}
			return Math.floor(result.total);
		} catch {
			// Fallback to parseInt if dice evaluation fails
			return parseInt(expression) || 0;
		}
	}

	public static adjustSheetWithModifiers(sheet: Sheet, modifiers: Condition[]) {
		const activeSheetModifiers: Condition[] = modifiers
			.filter((modifier): modifier is Condition => modifier.sheetAdjustments.length > 0)
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

			// Replace all bracket references (like [level], [strength], [severity]) with placeholder
			// values for validation. The actual values will be resolved when the adjustment is applied.
			const attributeRegex = /\[[^\[\]]+\]/g;
			if (
				!SheetAdjuster.validateSheetAdjustment({
					...sheetAdjustment,
					value: sheetAdjustment.value.replaceAll(attributeRegex, '1'),
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
			// Only resolve bracket references and evaluate math for numeric property types
			const numericPropertyTypes = [
				AdjustablePropertyEnum.intProperty,
				AdjustablePropertyEnum.baseCounter,
				AdjustablePropertyEnum.weaknessResistance,
			];

			// For stat, extraSkill, and attack adjustments, check if it's an ability property
			// (which expects string values like "str", "con", etc.)
			let isAbilityProperty = false;
			if (
				adjustment.propertyType === AdjustablePropertyEnum.stat ||
				adjustment.propertyType === AdjustablePropertyEnum.extraSkill
			) {
				// Ability properties end with "ability" in their property name
				isAbilityProperty = adjustment.property.toLowerCase().endsWith('ability');
			}
			// Attack adjustments always have string values (complex format), so don't evaluate
			if (adjustment.propertyType === AdjustablePropertyEnum.attack) {
				adjuster.adjust(adjustment);
				continue;
			}

			if (
				numericPropertyTypes.includes(adjustment.propertyType) ||
				((adjustment.propertyType === AdjustablePropertyEnum.stat ||
					adjustment.propertyType === AdjustablePropertyEnum.extraSkill) &&
					!isAbilityProperty)
			) {
				// Resolve bracket references (like [level], [strength]) in the adjustment value
				const resolvedValue = this.parseSheetReferences(adjustment.value, sheet);
				// Evaluate math expressions in the resolved value
				const evaluatedValue = this.evaluateMathExpression(resolvedValue);
				adjuster.adjust({
					...adjustment,
					value: evaluatedValue.toString(),
				});
			} else {
				// For non-numeric types (info, infoList) or ability properties, pass through unchanged
				adjuster.adjust(adjustment);
			}
		}
		return adjustedSheet;
	}
}
