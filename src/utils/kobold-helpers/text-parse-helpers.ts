const characterIdRegex = /characters\/([0-9]+)/;
const pastebinIdRegex = /pastebin\.com(?:\/raw)?\/([A-Za-z0-9]+)/;

export class TextParseHelpers {
	/**
	 * Parses the text to find a character id out of a url or parses full string as a number
	 * @param text either a wanderer's guide url, or simply a numeric character id
	 */
	public static parseCharacterIdFromText(text: string): number | null {
		const trimmedText = text.trim();
		let charId = null;
		if (!isNaN(Number(trimmedText.trim()))) {
			// we allow just a character id to be passed in as well
			charId = Number(trimmedText.trim());
		} else {
			// match the trimmedText to the regex
			const matches = trimmedText.match(characterIdRegex);
			if (!matches) {
				charId = null;
			} else charId = Number(matches[1]);
		}
		return charId;
	}

	/**
	 * Parses the text to find a pastebin id out of a url or parses full string as a number
	 * @param text either a pastebin url, or simply a pastebin post id
	 */
	public static parsePastebinIdFromText(text: string): string | null {
		const trimmedText = text.trim();
		let pastebinId: string | null = null;
		if (/^([A-Za-z0-9]+)$/.test(trimmedText)) {
			// we allow just a pastebin id to be passed in as well
			pastebinId = text;
		} else {
			// match the trimmedText to the regex
			const matches = trimmedText.match(pastebinIdRegex);
			if (!matches) {
				pastebinId = null;
			} else pastebinId = matches[1];
		}
		return pastebinId;
	}
}
