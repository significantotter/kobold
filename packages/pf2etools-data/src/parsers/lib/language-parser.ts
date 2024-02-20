import type { EmbedData } from 'discord.js';
import type { Language } from '../../schemas/index.js';
import type { CompendiumEmbedParser } from '../compendium-parser.js';

export async function _parseLanguage(this: CompendiumEmbedParser, language: Language) {
	const preprocessedData = (await this.preprocessData(language)) as Language;
	return parseLanguage.call(this, preprocessedData);
}

export function parseLanguage(this: CompendiumEmbedParser, language: Language): EmbedData {
	const title = `${language.name}`;

	const descriptionLines: string[] = [];
	if (language.typicalSpeakers)
		descriptionLines.push(`**Typical Speakers** ${language.typicalSpeakers.join(', ')}`);
	if (language.regions) descriptionLines.push(`**Regions** ${language.regions.join(', ')}`);
	if (language.entries?.length)
		descriptionLines.push(this.entryParser.parseEntries(language.entries));
	return {
		title: title,
		description: descriptionLines.join('\n'),
	};
}
