import { EmbedData } from 'discord.js';
import { QuickRule } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseQuickRule(
	this: CompendiumEmbedParser,
	quickRule: QuickRule
): Promise<EmbedData> {
	const title = `${quickRule.name}`;
	const entryParser = new EntryParser({ delimiter: '\n\n', emojiConverter: this.emojiConverter });
	const description = entryParser.parseEntry(quickRule.rule);
	return {
		title: title,
		description: description,
	};
}
