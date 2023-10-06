import { EmbedData } from 'discord.js';
import { Background } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function _parseBackground(this: CompendiumEmbedParser, background: Background) {
	const preprocessedData = (await this.preprocessData(background)) as Background;
	return parseBackground.call(this, preprocessedData);
}

export function parseBackground(this: CompendiumEmbedParser, background: Background): EmbedData {
	const entryParser = new EntryParser({ delimiter: '\n', emojiConverter: this.emojiConverter });
	const title = `${background.name}`;
	const descriptionLines = [];
	if (background.traits) descriptionLines.push(`**Traits:** ${background.traits.join(', ')}`);
	descriptionLines.push(entryParser.parseEntries(background.entries));
	return {
		title: title,
		description: descriptionLines.join('\n'),
	};
}
