import { EmbedData } from 'discord.js';
import { Language } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseLanguage(
	this: CompendiumEmbedParser,
	language: Language
): Promise<EmbedData> {
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
