import type { EmbedData } from 'discord.js';
import type { Background } from '../../schemas/index.js';
import type { CompendiumEmbedParser } from '../compendium-parser.js';

export async function _parseBackground(this: CompendiumEmbedParser, background: Background) {
	const preprocessedData = (await this.preprocessData(background)) as Background;
	return parseBackground.call(this, preprocessedData);
}

export function parseBackground(this: CompendiumEmbedParser, background: Background): EmbedData {
	const title = `${background.name}`;
	const descriptionLines = [];
	if (background.traits) descriptionLines.push(`**Traits:** ${background.traits.join(', ')}`);
	descriptionLines.push(this.entryParser.parseEntries(background.entries));
	return {
		title: title,
		description: descriptionLines.join('\n'),
	};
}
