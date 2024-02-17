import type { EmbedData } from 'discord.js';
import type { Trait } from '../../schemas/index.js';
import type { CompendiumEmbedParser } from '../compendium-parser.js';

export async function _parseTrait(this: CompendiumEmbedParser, trait: Trait) {
	const preprocessedData = (await this.preprocessData(trait)) as Trait;
	return parseTrait.call(this, preprocessedData);
}

export function parseTrait(this: CompendiumEmbedParser, trait: Trait): EmbedData {
	const title = `${trait.name}`;

	const descriptionLines: string[] = [];
	if (trait.categories) descriptionLines.push(`**Categories** ${trait.categories.join(', ')}`);

	descriptionLines.push(this.entryParser.parseEntries(trait.entries));
	return {
		title: title,
		description: descriptionLines.join('\n'),
	};
}
