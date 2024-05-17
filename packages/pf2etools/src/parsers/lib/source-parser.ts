import type { EmbedData } from 'discord.js';
import type { Source } from '../../schemas/index.js';
import type { CompendiumEmbedParser } from '../compendium-parser.js';

export async function _parseSource(this: CompendiumEmbedParser, source: Source) {
	const preprocessedData = (await this.preprocessData(source)) as Source;
	return parseSource.call(this, preprocessedData);
}

export function parseSource(this: CompendiumEmbedParser, source: Source): EmbedData {
	const title = `${source.name}`;

	const descriptionLines: string[] = [];
	if (source.entries) descriptionLines.push(this.entryParser.parseEntries(source.entries));
	return {
		title: title,
		url: source.store,
		description: descriptionLines.join('\n'),
	};
}
