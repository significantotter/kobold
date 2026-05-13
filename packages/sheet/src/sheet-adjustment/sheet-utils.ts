import _ from 'lodash';
import { Dice } from 'dice-typescript';
import {
	AdjustablePropertyEnum,
	Condition,
	isSheetIntegerKeys,
	Sheet,
	SheetAdjustment,
	SheetAdjustmentOperationEnum,
	SheetAdjustmentTypeEnum,
	StatSubGroupEnum,
	isStatSubGroupEnum,
} from '@kobold/db';
import { KoboldError } from '@kobold/util';
import { SheetAdjuster } from './sheet-adjuster.js';
import { SheetAdjustmentBucketer } from './sheet-adjustment-bucketer.js';
import {
	SheetAdditionalSkillProperties,
	SheetBaseCounterProperties,
	SheetIntegerProperties,
	SheetProperties,
	SheetStatProperties,
	SheetWeaknessResistanceProperties,
} from './sheet-properties.js';

// Regex to match bracket references like [level], [strength], etc.
const attributeRegex = /(\[[\w \-_\.]{2,}\])/g;
const severityRegex = /\[[^\w\-\[]*severity[^\w\-\]]*\]/gi;
const attributeShorthands: Record<string, string> = {
	str: 'strength',
	dex: 'dexterity',
	con: 'constitution',
	int: 'intelligence',
	wis: 'wisdom',
	cha: 'charisma',
	fort: 'fortitude',
	ref: 'reflex',
	health: 'hp',
	temphealth: 'tempHp',
	perc: 'perception',
};

export class SheetUtils {
	private static getSeverityAppliedModifier(modifier: Condition): Condition {
		return JSON.parse(
			JSON.stringify(modifier).replaceAll(severityRegex, (modifier.severity ?? 0).toString())
		);
	}

	private static getComputedSheetAttributeValue(
		sheet: Sheet,
		attributeName: string
	): number | null {
		const level = sheet.staticInfo.level ?? 0;
		const weaponProficiencies: Record<string, number> = {
			unarmed: sheet.intProperties.unarmedProficiency ?? 0,
			simple: sheet.intProperties.simpleProficiency ?? 0,
			martial: sheet.intProperties.martialProficiency ?? 0,
			advanced: sheet.intProperties.advancedProficiency ?? 0,
		};
		for (const [name, proficiency] of Object.entries(weaponProficiencies)) {
			if (
				[
					name,
					name + 'weapon',
					name + 'attack',
					name + 'proficiency',
					name + 'prof',
					name + 'profmod',
					name + 'weaponprof',
					name + 'attackprof',
					name + 'weaponprofmod',
					name + 'attackprofmod',
					name + 'weaponproficiency',
					name + 'attackproficiency',
				].includes(attributeName)
			) {
				return level + proficiency;
			}
		}

		const armorProficiencies: Record<string, number> = {
			unarmored: sheet.intProperties.unarmoredProficiency ?? 0,
			light: sheet.intProperties.lightProficiency ?? 0,
			medium: sheet.intProperties.mediumProficiency ?? 0,
			heavy: sheet.intProperties.heavyProficiency ?? 0,
		};
		for (const [name, proficiency] of Object.entries(armorProficiencies)) {
			if (
				[
					name,
					name + 'armor',
					name + 'defense',
					name + 'proficiency',
					name + 'armorprof',
					name + 'defenseprof',
					name + 'armorproficiency',
					name + 'defenseproficiency',
				].includes(attributeName)
			) {
				return level + proficiency;
			}
		}

		const proficiencyValues: Record<string, number> = {
			untrained: level,
			trained: level + 2,
			expert: level + 4,
			master: level + 6,
			legendary: level + 8,
		};
		for (const [name, value] of Object.entries(proficiencyValues)) {
			if (
				[name, name + 'total', name + 'bonus', name + 'mod', name + 'modifier'].includes(
					attributeName
				)
			) {
				return value;
			}
		}

		return null;
	}

	private static getAttributeValueFromSheet(sheet: Sheet, name: string): number | null {
		const trimRegex = /[\[\]\\_\-]/g;
		const trimmedName = name.replace(trimRegex, '').trim().toLowerCase();
		const attributeName = attributeShorthands[trimmedName] || trimmedName;
		const standardizedName = SheetProperties.standardizeProperty(attributeName);
		const nameWithoutBrackets = name.replace(/[\[\]]/g, '').trim();
		const standardizedCustomPropName =
			SheetProperties.standardizeCustomPropName(nameWithoutBrackets);

		const staticAttributes: Record<string, number> = {
			level: sheet.staticInfo.level ?? 0,
			untrained: sheet.staticInfo.level ?? 0,
			trained: (sheet.staticInfo.level ?? 0) + 2,
			expert: (sheet.staticInfo.level ?? 0) + 4,
			master: (sheet.staticInfo.level ?? 0) + 6,
			legendary: (sheet.staticInfo.level ?? 0) + 8,
		};
		if (staticAttributes[attributeName] !== undefined) {
			return staticAttributes[attributeName];
		}

		const computedValue = this.getComputedSheetAttributeValue(
			sheet,
			standardizedName.toLowerCase()
		);
		if (computedValue !== null) {
			return computedValue;
		}

		if (isSheetIntegerKeys(standardizedName) && sheet.intProperties[standardizedName] != null) {
			return sheet.intProperties[standardizedName] ?? 0;
		}

		if (SheetStatProperties.isSheetStatPropertyName(standardizedName)) {
			const property = SheetStatProperties.properties[standardizedName];
			if (property.subKey === StatSubGroupEnum.ability) return null;
			return sheet.stats[property.baseKey][property.subKey] ?? 0;
		}

		const counterNameWithoutSpaces = trimmedName.replaceAll(' ', '');
		const counterReadAlias = SheetBaseCounterProperties.readAliases[counterNameWithoutSpaces];
		if (counterReadAlias) {
			const sheetValue = sheet.baseCounters[counterReadAlias.key];
			const value = counterReadAlias.variant === 'max' ? sheetValue.max : sheetValue.current;
			return value ?? 0;
		}

		const propertyMatch = SheetAdditionalSkillProperties.propertyNameRegex.exec(
			standardizedCustomPropName
		);
		const additionalSkill = sheet.additionalSkills.find(
			skill => skill.name === propertyMatch?.[1]
		);
		const additionalSkillSubKey = propertyMatch?.[2] ?? 'bonus';
		if (additionalSkill && isStatSubGroupEnum(additionalSkillSubKey)) {
			if (additionalSkillSubKey === StatSubGroupEnum.ability) return null;
			return additionalSkill[additionalSkillSubKey] ?? 0;
		}

		const weakResMatch = SheetWeaknessResistanceProperties.propertyNameRegex.exec(
			standardizedCustomPropName
		);
		const weakness = sheet.weaknessesResistances.weaknesses.find(
			w => w.type === weakResMatch?.[1]
		);
		const resistance = sheet.weaknessesResistances.resistances.find(
			r => r.type === weakResMatch?.[1]
		);
		return weakness?.amount ?? resistance?.amount ?? null;
	}

	/**
	 * Parses bracket references (like [level], [strength]) from a string value using sheet data.
	 * Returns the expression with bracket references replaced by their numeric values.
	 */
	public static parseSheetReferences(value: string, sheet: Sheet): string {
		const splitExpression = value.split(attributeRegex);
		let finalExpression = '';

		for (const token of splitExpression) {
			if (attributeRegex.test(token)) {
				// Remove brackets to get the attribute name
				const attributeName = token.replace(/[\[\]]/g, '').trim();

				const attributeValue = this.getAttributeValueFromSheet(sheet, attributeName);

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
			this.getSeverityAppliedModifier
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
