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
	/**
	 * Returns a copy of a sheet with explicitly supplied static values replaced.
	 * Static values are intentionally kept outside the sheet-adjustment system.
	 */
	public static withStaticInfo(
		sheet: Sheet,
		overrides: Partial<Sheet['staticInfo']>
	): Sheet {
		const updatedSheet = _.cloneDeep(sheet);
		for (const [key, value] of Object.entries(overrides)) {
			if (value !== undefined) {
				Object.assign(updatedSheet.staticInfo, { [key]: value });
			}
		}
		return updatedSheet;
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

	private static getAttributeValueFromSheet(sheet: Sheet, name: string): number | undefined {
		const trimRegex = /[\[\]\\_\-]/g;
		const trimmedName = name.replace(trimRegex, '').trim().toLowerCase();
		const attributeName = attributeShorthands[trimmedName] || trimmedName;
		const standardizedName = SheetProperties.standardizeProperty(attributeName);
		const nameWithoutBrackets = name.replace(/[\[\]]/g, '').trim();
		const standardizedCustomPropName =
			SheetProperties.standardizeCustomPropName(nameWithoutBrackets);

		const staticAttributes: Record<string, number> = {
			level: sheet.staticInfo.level ?? 0,
			usesstamina: sheet.staticInfo.usesStamina ? 1 : 0,
			'uses stamina': sheet.staticInfo.usesStamina ? 1 : 0,
			untrained: sheet.staticInfo.level ?? 0,
			trained: (sheet.staticInfo.level ?? 0) + 2,
			expert: (sheet.staticInfo.level ?? 0) + 4,
			master: (sheet.staticInfo.level ?? 0) + 6,
			legendary: (sheet.staticInfo.level ?? 0) + 8,
		};
		if (Object.hasOwn(staticAttributes, attributeName)) {
			return staticAttributes[attributeName];
		}

		const computedValue = this.getComputedSheetAttributeValue(
			sheet,
			standardizedName.toLowerCase()
		);
		if (computedValue !== null) {
			return computedValue;
		}

		if (isSheetIntegerKeys(standardizedName)) {
			return sheet.intProperties[standardizedName] ?? 0;
		}

		if (SheetStatProperties.isSheetStatPropertyName(standardizedName)) {
			const property = SheetStatProperties.properties[standardizedName];
			if (property.subKey === StatSubGroupEnum.ability) return undefined;
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
			if (additionalSkillSubKey === StatSubGroupEnum.ability) return undefined;
			return additionalSkill[additionalSkillSubKey] ?? 0;
		}

		const weakResMatch = SheetWeaknessResistanceProperties.propertyNameRegex.exec(
			standardizedCustomPropName
		);
		const weakness = sheet.defenses.weaknesses.find(
			w => w.label === weakResMatch?.[1] && w.amount != null
		);
		const resistance = sheet.defenses.resistances.find(
			r => r.label === weakResMatch?.[1] && r.amount != null
		);
		return weakness?.amount ?? resistance?.amount;
	}

	/**
	 * Parses bracket references (like [level], [strength]) from a string value using sheet data.
	 * Returns the expression with bracket references replaced by their numeric values.
	 */
	public static parseSheetReferences(
		value: string,
		sheet: Sheet,
		extraReferences: Readonly<Record<string, number>> = {}
	): string {
		const splitExpression = value.split(attributeRegex);
		let finalExpression = '';

		for (const token of splitExpression) {
			if (/^\[[\w \-_\.]{2,}\]$/.test(token)) {
				// Remove brackets to get the attribute name
				const attributeName = token.replace(/[\[\]]/g, '').trim();
				const normalizedAttributeName = attributeName.toLowerCase();
				const attributeValue = Object.hasOwn(extraReferences, normalizedAttributeName)
					? extraReferences[normalizedAttributeName]
					: this.getAttributeValueFromSheet(sheet, attributeName);

				if (attributeValue !== undefined) {
					// Wrap negative values in parentheses for proper math evaluation
					finalExpression += attributeValue < 0 ? `(${attributeValue})` : attributeValue;
				} else {
					throw new KoboldError(
						`Yip! I couldn't find a numeric sheet value named "[${attributeName}]".`
					);
				}
			} else {
				finalExpression += token;
			}
		}

		return finalExpression;
	}

	private static parseSheetStringReferences(
		value: string,
		sheet: Sheet,
		extraReferences: Readonly<Record<string, number>> = {}
	): string {
		return value.replace(/\[([^\[\]]+)\]/g, (_match, rawName: string) => {
			const normalizedName = rawName.toLowerCase().replace(/[\s_\-]/g, '');
			if (normalizedName === 'keyability') {
				return sheet.staticInfo.keyAbility ?? '';
			}
			const trimmedName = rawName.trim();
			const extraReferenceName = trimmedName.toLowerCase();
			const numericValue = Object.hasOwn(extraReferences, extraReferenceName)
				? extraReferences[extraReferenceName]
				: this.getAttributeValueFromSheet(sheet, trimmedName);
			if (numericValue !== undefined) return numericValue.toString();
			throw new KoboldError(
				`Yip! I couldn't find a sheet value named "[${trimmedName}]".`
			);
		});
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
				throw new Error(result.errors.join('; '));
			}
			return Math.floor(result.total);
		} catch {
			throw new KoboldError(
				`Yip! I couldn't evaluate the sheet adjustment value "${expression}".`
			);
		}
	}

	public static adjustSheetWithModifiers(sheet: Sheet, modifiers: Condition[]) {
		const activeSheetModifiers: Condition[] = modifiers
			.filter((modifier): modifier is Condition => modifier.sheetAdjustments.length > 0)
			.filter(modifier => modifier.isActive);

		const resolvedAdjustments = activeSheetModifiers.flatMap(modifier =>
			modifier.sheetAdjustments.map(adjustment =>
				this.resolveSheetAdjustment(sheet, adjustment, {
					severity: modifier.severity ?? 0,
				})
			)
		);
		return this.applyResolvedSheetAdjustments(sheet, resolvedAdjustments);
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
			const isAbilityProperty =
				(sheetAdjustment.propertyType === AdjustablePropertyEnum.stat ||
					sheetAdjustment.propertyType === AdjustablePropertyEnum.extraSkill) &&
				sheetAdjustment.property.toLowerCase().endsWith('ability');
			if (
				!SheetAdjuster.validateSheetAdjustment({
					...sheetAdjustment,
					value: sheetAdjustment.value.replaceAll(
						attributeRegex,
						isAbilityProperty ? 'str' : '1'
					),
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
		const resolvedAdjustments = sheetAdjustments.map(adjustment =>
			this.resolveSheetAdjustment(sheet, adjustment)
		);
		return this.applyResolvedSheetAdjustments(sheet, resolvedAdjustments);
	}

	private static isNumericAdjustment(adjustment: SheetAdjustment): boolean {
		const numericPropertyTypes = [
			AdjustablePropertyEnum.intProperty,
			AdjustablePropertyEnum.baseCounter,
			AdjustablePropertyEnum.weaknessResistance,
		];
		if (numericPropertyTypes.includes(adjustment.propertyType)) return true;

		return (
			(adjustment.propertyType === AdjustablePropertyEnum.stat ||
				adjustment.propertyType === AdjustablePropertyEnum.extraSkill) &&
			!adjustment.property.toLowerCase().endsWith('ability')
		);
	}

	private static resolveSheetAdjustment(
		sheet: Sheet,
		adjustment: SheetAdjustment,
		extraReferences: Readonly<Record<string, number>> = {}
	): SheetAdjustment {
		if (!this.isNumericAdjustment(adjustment)) {
			return {
				...adjustment,
				value: this.parseSheetStringReferences(adjustment.value, sheet, extraReferences),
			};
		}

		const resolvedValue = this.parseSheetReferences(
			adjustment.value,
			sheet,
			extraReferences
		);
		return {
			...adjustment,
			value: this.evaluateMathExpression(resolvedValue).toString(),
		};
	}

	private static applyResolvedSheetAdjustments(
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
