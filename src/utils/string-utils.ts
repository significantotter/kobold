import removeMarkdown from 'remove-markdown';
import { Character } from '../services/kobold/models/index.js';
import { KoboldError } from './KoboldError.js';
import { Creature } from './creature.js';
import _ from 'lodash';
import { SheetUtils } from './sheet-utils.js';

export class StringUtils {
	public static parseSheetModifiers(
		input: string,
		creature: Creature
	): Character['modifiers'][0]['sheetAdjustments'] {
		const modifierList = input.split(';').filter(result => result.trim() !== '');
		if (!modifierList.length) {
			throw new KoboldError("Yip! I didn't find any modifiers in what you sent me!");
		}
		const modifiers = modifierList.map(modifier => {
			const modifierRegex = /([A-Za-z _-]+)\s*([\+\-\=])\s*(.+)/g;
			const match = modifierRegex.exec(modifier);
			if (!match) {
				throw new KoboldError(
					`Yip! I couldn't understand the modifier "${modifier}". Modifiers must be ` +
						`in the format "Attribute Name + 1; Other Attribute - 1;final attribute = 1". Spaces are optional.`
				);
			}
			let [, attributeName, operator, value] = match.map(result => result.trim());

			// validate each result
			// attributeName must be a valid sheet property
			if (!SheetUtils.validateSheetProperty(attributeName)) {
				throw new KoboldError(
					`Yip! I couldn't find a sheet attribute named "${attributeName}".`
				);
			}
			// operator must be +, -, or =
			if (!['+', '-', '='].includes(operator)) {
				throw new KoboldError(
					`Yip! I couldn't understand the operator "${operator}". Operators must be +, -, or =.`
				);
			}
			// value must be a number if it's a numeric value
			if (SheetUtils.sheetPropertyIsNumeric(attributeName) && isNaN(Number(value))) {
				throw new KoboldError(
					`Yip! ${attributeName} "${value}" couldn't be converted to a number.`
				);
			}
			return {
				property: attributeName,
				operation: operator as '+' | '-' | '=',
				value: value,
			};
		});
		return modifiers;
	}

	public static truncate(input: string, length: number, addEllipsis: boolean = false): string {
		if (input.length <= length) {
			return input;
		}

		let output = input.substring(0, addEllipsis ? length - 3 : length);
		if (addEllipsis) {
			output += '...';
		}

		return output;
	}

	public static stripMarkdown(input: string): string {
		return removeMarkdown(input);
	}

	public static findClosestInObjectArray<T extends { [k: string]: any }>(
		targetWord: string,
		objectArray: T[],
		propertyName: string
	): T | undefined {
		if (!objectArray || objectArray.length === 0) return undefined;
		return objectArray.sort(
			StringUtils.generateSorterByWordDistance<T>(targetWord, obj =>
				_.isString(obj[propertyName]) ? obj[propertyName] : null
			)
		)[0];
	}

	public static findBestValueByKeyMatch(
		targetWord: string,
		wordObject: { [key: string]: unknown }
	): any {
		if (!wordObject) return undefined;
		const word = this.findClosestWord(targetWord, Object.keys(wordObject));
		if (!word) return undefined;
		return wordObject[word];
	}

	public static findClosestWord(targetWord: string, wordArray: string[]): string | undefined {
		if (!wordArray || wordArray.length === 0) return undefined;
		return wordArray.sort(
			StringUtils.generateSorterByWordDistance<string>(targetWord, word => word)
		)[0];
	}

	public static generateSorterByWordDistance<T>(
		targetWord: string,
		inputToStringFn: (input: T) => string
	) {
		return (a: T | null, b: T | null) => {
			if (a === null && b === null) return 0;
			if (a === null) return 1;
			if (b === null) return -1;
			const aDistance = StringUtils.levenshteinDistance(targetWord, inputToStringFn(a));
			const bDistance = StringUtils.levenshteinDistance(targetWord, inputToStringFn(b));
			return aDistance - bDistance;
		};
	}

	// determines the distance between two strings
	// taken from stack overflow
	public static levenshteinDistance(str1: string, str2: string) {
		const track = Array(str2.length + 1)
			.fill(null)
			.map(() => Array(str1.length + 1).fill(null));
		for (let i = 0; i <= str1.length; i += 1) {
			track[0][i] = i;
		}
		for (let j = 0; j <= str2.length; j += 1) {
			track[j][0] = j;
		}
		for (let j = 1; j <= str2.length; j += 1) {
			for (let i = 1; i <= str1.length; i += 1) {
				const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
				track[j][i] = Math.min(
					track[j][i - 1] + 1, // deletion
					track[j - 1][i] + 1, // insertion
					track[j - 1][i - 1] + indicator // substitution
				);
			}
		}
		return track[str2.length][str1.length];
	}
}
