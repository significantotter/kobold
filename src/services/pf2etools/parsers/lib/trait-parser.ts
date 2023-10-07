import { EmbedData } from 'discord.js';
import { Trait } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function _parseTrait(this: CompendiumEmbedParser, trait: Trait) {
	const preprocessedData = (await this.preprocessData(trait)) as Trait;
	return parseTrait.call(this, preprocessedData);
}

export function parseTrait(this: CompendiumEmbedParser, trait: Trait): EmbedData {
	const title = `${trait.name}`;
	const entryParser = new EntryParser({ delimiter: '\n', emojiConverter: this.emojiConverter });
	const descriptionLines: string[] = [];
	if (trait.categories) descriptionLines.push(`**Categories** ${trait.categories.join(', ')}`);

	descriptionLines.push(entryParser.parseEntries(trait.entries));
	return {
		title: title,
		description: descriptionLines.join('\n'),
	};
}
