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

	public static stripMarkdown(input: string): string {
		return removeMarkdown(input);
	}

	public static findClosestInObjectArray<T extends object>(
		targetWord: string,
		wordArray: T[],
		propertyName
	): T {
		if (!wordArray || wordArray.length === 0) return undefined;
		return wordArray.sort(
			StringUtils.generateSorterByWordDistance(targetWord, word => word[propertyName])
		)[0];
	}

	public static findBestValueByKeyMatch(
		targetWord: string,
		wordObject: { [key: string]: any }
	): any {
		if (!wordObject) return undefined;
		const word = this.findClosestWord(targetWord, Object.keys(wordObject));
		return wordObject[word];
	}

	public static findClosestWord(targetWord: string, wordArray: string[]): string {
		if (!wordArray || wordArray.length === 0) return undefined;
		return wordArray.sort(
			StringUtils.generateSorterByWordDistance(targetWord, word => word)
		)[0];
	}

	public static generateSorterByWordDistance(
		targetWord: string,
		inputToStringFn: (input: any) => string
	) {
		return (a, b) => {
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
