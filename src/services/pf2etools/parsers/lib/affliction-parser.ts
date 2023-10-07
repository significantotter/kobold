import { EmbedData } from 'discord.js';
import { Affliction } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function _parseAffliction(this: CompendiumEmbedParser, affliction: Affliction) {
	const preprocessedData = (await this.preprocessData(affliction)) as Affliction;
	return parseAffliction.call(this, preprocessedData);
}

export function parseAffliction(this: CompendiumEmbedParser, affliction: Affliction): EmbedData {
	const entryParser = new EntryParser({ delimiter: '\n', emojiConverter: this.emojiConverter });
	const title = `${affliction.name}`;
	const description = entryParser.parseAfflictionEntry(affliction, false);
	return {
		title: title,
		description: description,
	};
}
