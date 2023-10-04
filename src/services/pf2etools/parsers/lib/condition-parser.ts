import { EmbedData } from 'discord.js';
import { Condition } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseCondition(
	this: CompendiumEmbedParser,
	condition: Condition
): Promise<EmbedData> {
	const entryParser = new EntryParser({ delimiter: '\n\n', emojiConverter: this.emojiConverter });
	const title = `${condition.name}`;
	const description = entryParser.parseEntries(condition.entries);
	return {
		title: title,
		description: description,
	};
}
