import { SheetAdjustment, SheetAdjustmentTypeEnum, getDefaultSheet } from '@kobold/db';
import { KoboldError } from './KoboldError.js';
import { SheetUtils } from './sheet/sheet-utils.js';
import { compileExpression } from 'filtrex';
import { Creature } from './creature.js';
import { DiceUtils } from './dice-utils.js';
import _ from 'lodash';

export class InputParseUtils {
	/**
	 * Convert the input into a valid boolean
	 */
	static parseAsBoolean(input: string): boolean {
		return ['true', 'yes', '1', 'ok', 'okay'].includes(input.trim().toLowerCase());
	}
	/**
	 * Whether the input string is a text value indicating it should be replaced by
	 * a null value. Ex. "no", "none", "null", "clear", "remove", "x", or "''"
	 */
	static isNullString(input: string): boolean {
		return [
			'-',
			'no',
			'none',
			'null',
			'clear',
			'remove',
			'x',
			'',
			'.',
			'""',
			"''",
			'``',
		].includes(input.trim().toLowerCase());
	}
	/**
	 * Whether the input is a valid string
	 */
	static isValidString(
		input: string,
		{ maxLength, minLength }: { maxLength?: number; minLength?: number } = {}
	): boolean {
		return (
			(minLength !== undefined ? input.length >= minLength : true) &&
			(maxLength !== undefined ? input.length <= maxLength : true)
		);
	}
	static parseAsString(
		input: string,
		{
			maxLength,
			minLength,
			inputName,
		}: { maxLength?: number; minLength?: number; inputName?: string } = {}
	): string {
		if (this.isValidString(input, { minLength, maxLength })) {
			return input;
		} else {
			let minMessage = minLength != undefined ? `greater than ${minLength}` : '';
			let maxMessage = maxLength != undefined ? `less than ${maxLength}` : '';
			throw new KoboldError(
				`Yip! ${inputName ?? 'The input'} must be ${[minMessage, maxMessage].filter(_.identity).join(' and ')} characters.`
			);
		}
	}
	static parseAsNullableString(
		input: string | null,
		{
			maxLength,
			minLength,
			inputName,
		}: { maxLength?: number; minLength?: number; inputName?: string } = {}
	): string | null {
		if (input === null || this.isNullString(input)) {
			return null;
		} else {
			return this.parseAsString(input, { maxLength, minLength, inputName });
		}
	}

	static isValidNumber(input: string): boolean {
		return /^[0-9,]+(\.[0-9,]*)?$/.test(input.trim());
	}
	static parseAsNumber(input: string): number {
		if (this.isValidNumber(input)) {
			return Number(input.replaceAll(',', ''));
		}
		throw new KoboldError(
			`Yip! I couldn't figure out how to read "${input}" as a number. I can only read numbers with numeric digits, commas, and a single optional decimal point. Like 2,500.6 or 43.`
		);
	}
	static parseAsNullableNumber(input: string | null): number | null {
		if (input === null || this.isNullString(input)) {
			return null;
		} else {
			return this.parseAsNumber(input);
		}
	}

	static parseAsSheetAdjustments(
		input: string,
		type: SheetAdjustmentTypeEnum,
		targetSheet = getDefaultSheet()
	): SheetAdjustment[] {
		// attempt to use the adjustments to make sure they're valid
		const sheetAdjustments = SheetUtils.stringToSheetAdjustments(input, type);
		SheetUtils.adjustSheetWithModifiers(targetSheet, [
			{
				name: 'test',
				description: null,
				isActive: true,
				rollAdjustment: null,
				rollTargetTags: null,
				severity: 1,
				note: null,
				sheetAdjustments,
				type: SheetAdjustmentTypeEnum.untyped,
			},
		]);
		return sheetAdjustments;
	}

	static isValidRollTargetTags(input: string): boolean {
		try {
			compileExpression(input);
			return true;
		} catch (err) {
			return false;
		}
	}

	static isValidDiceExpression(input: string, creature?: Creature): boolean {
		// we must be able to evaluate the modifier as a roll for this character
		const result = DiceUtils.parseAndEvaluateDiceExpression({
			rollExpression: input,
			extraAttributes: [
				{
					name: 'severity',
					value: 1,
					type: SheetAdjustmentTypeEnum.untyped,
					tags: [],
					aliases: [],
				},
			],
			creature:
				creature ??
				new Creature({
					sheet: getDefaultSheet(),
					conditions: [],
					modifiers: [],
					actions: [],
					rollMacros: [],
				}),
		});
		if (result.results.errors.length === 0) {
			return true;
		} else return false;
	}
}
