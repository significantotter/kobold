import { EmbedData } from 'discord.js';
import { VersatileHeritage } from '../../models/index.js';
import { EntryParser } from '../compendium-entry-parser.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';

export async function _parseVersatileHeritage(
	this: CompendiumEmbedParser,
	versatileHeritage: VersatileHeritage
) {
	const preprocess = this.preprocessData(versatileHeritage) as VersatileHeritage;
	return parseVersatileHeritage.call(this, versatileHeritage);
}

export async function parseVersatileHeritage(
	this: CompendiumEmbedParser,
	versatileHeritage: VersatileHeritage
): Promise<EmbedData> {
	const title = `${versatileHeritage.name}`;
	const entryParser = new EntryParser({ delimiter: '\n', emojiConverter: this.emojiConverter });
	const descriptionLines: string[] = [];
	if (versatileHeritage.rarity) descriptionLines.push(`**Rarity:** ${versatileHeritage.rarity}`);
	if (versatileHeritage.traits)
		descriptionLines.push(`**Traits:** ${versatileHeritage.traits.join(', ')}`);
	if (versatileHeritage.entries?.length)
		descriptionLines.push(entryParser.parseEntries(versatileHeritage.entries));
	return {
		title: title,
		description: descriptionLines.join('\n'),
	};
}
