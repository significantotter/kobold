import { EmbedData } from 'discord.js';
import { Language } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function _parseLanguage(this: CompendiumEmbedParser, language: Language) {
	const preprocessedData = (await this.preprocessData(language)) as Language;
	return parseLanguage.call(this, preprocessedData);
}

export function parseLanguage(this: CompendiumEmbedParser, language: Language): EmbedData {
	const title = `${language.name}`;
	const entryParser = new EntryParser({ delimiter: '\n\n', emojiConverter: this.emojiConverter });
	const descriptionLines: string[] = [];
	if (language.typicalSpeakers)
		descriptionLines.push(`**Typical Speakers** ${language.typicalSpeakers.join(', ')}`);
	if (language.regions) descriptionLines.push(`**Regions** ${language.regions.join(', ')}`);
	if (language.entries?.length) descriptionLines.push(entryParser.parseEntries(language.entries));
	return {
		title: title,
		description: descriptionLines.join('\n'),
	};
}
