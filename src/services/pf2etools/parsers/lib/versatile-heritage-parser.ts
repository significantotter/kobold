import type { EmbedData } from 'discord.js';
import type { VersatileHeritage } from '../../schemas/index.js';

import type { CompendiumEmbedParser } from '../compendium-parser.js';

export async function _parseVersatileHeritage(
	this: CompendiumEmbedParser,
	versatileHeritage: VersatileHeritage
) {
	const preprocessedData = (await this.preprocessData(versatileHeritage)) as VersatileHeritage;
	return parseVersatileHeritage.call(this, preprocessedData);
}

export function parseVersatileHeritage(
	this: CompendiumEmbedParser,
	versatileHeritage: VersatileHeritage
): EmbedData {
	const title = `${versatileHeritage.name}`;

	const descriptionLines: string[] = [];
	if (versatileHeritage.rarity) descriptionLines.push(`**Rarity:** ${versatileHeritage.rarity}`);
	if (versatileHeritage.traits)
		descriptionLines.push(`**Traits:** ${versatileHeritage.traits.join(', ')}`);
	if (versatileHeritage.entries?.length)
		descriptionLines.push(this.entryParser.parseEntries(versatileHeritage.entries));
	return {
		title: title,
		description: descriptionLines.join('\n'),
	};
}
