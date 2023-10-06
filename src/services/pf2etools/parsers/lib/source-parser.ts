import { EmbedData } from 'discord.js';
import { Source } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function _parseSource(this: CompendiumEmbedParser, source: Source) {
	const preprocessedData = (await this.preprocessData(source)) as Source;
	return parseSource.call(this, preprocessedData);
}

export function parseSource(this: CompendiumEmbedParser, source: Source): EmbedData {
	const title = `${source.name}`;
	const entryParser = new EntryParser({ delimiter: '\n\n', emojiConverter: this.emojiConverter });
	const descriptionLines: string[] = [];
	if (source.entries) descriptionLines.push(entryParser.parseEntries(source.entries));
	return {
		title: title,
		url: source.store,
		description: descriptionLines.join('\n'),
	};
}
