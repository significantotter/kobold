import _ from 'lodash';
import removeMarkdown from 'remove-markdown';

export class StringUtils {
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
	/**
	 * Finds the array item whose Name property is closest to 'name'. Useful for loose string matching skills, etc.
	 * @param name the name to match
	 * @param matchTargets the targets of the match with property .Name
	 * @returns the closest matchTarget to name
	 */
	public static getBestNameMatch<
		T extends {
			Name: string;
		},
	>(name: string, matchTargets: T[]): T | null {
		if (matchTargets.length === 0) return null;

		let lowestMatchTarget = matchTargets[0];
		let lowestMatchTargetDistance = StringUtils.levenshteinDistance(
			(matchTargets[0].Name || '').toLowerCase(),
			name.toLowerCase()
		);
		for (let i = 1; i < matchTargets.length; i++) {
			const currentMatchTargetDistance = StringUtils.levenshteinDistance(
				(matchTargets[i].Name || '').toLowerCase(),
				name.toLowerCase()
			);
			if (currentMatchTargetDistance < lowestMatchTargetDistance) {
				lowestMatchTarget = matchTargets[i];
				lowestMatchTargetDistance = currentMatchTargetDistance;
			}
		}
		return lowestMatchTarget;
	}

	public static nameMatchGeneric<
		T extends {
			name?: string;
		},
	>(options: T[], name: string): T | null {
		let thing: T | null;
		if (options.length === 0) {
			return null;
		} else {
			const nameMatch = StringUtils.getBestNameMatch<{ Name: string; thing: T }>(
				name,
				options.map(thing => ({
					Name: String(thing.name),
					thing: thing,
				}))
			);
			thing = nameMatch?.thing ?? null;
		}
		return thing;
	}

	public static stringsToCommaPhrase(strings: string[]): string {
		return strings
			.map((value, index, arr) => `${index === arr.length - 1 ? 'or ' : ''}"${value}"`)
			.join(', ');
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
