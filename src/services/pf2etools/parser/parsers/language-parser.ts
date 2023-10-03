import { KoboldEmbed } from '../../../../utils/kobold-embed-utils.js';
import { Language } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseLanguage(
	this: CompendiumEmbedParser,
	language: Language
): Promise<KoboldEmbed> {
	const title = `${language.name}`;
	const entryParser = new EntryParser(this.helpers, { delimiter: '\n\n' });
	const descriptionLines: string[] = [];
	if (language.typicalSpeakers)
		descriptionLines.push(`**Typical Speakers** ${language.typicalSpeakers.join(', ')}`);
	if (language.regions) descriptionLines.push(`**Regions** ${language.regions.join(', ')}`);
	if (language.entries?.length) descriptionLines.push(entryParser.parseEntries(language.entries));
	return new KoboldEmbed({
		title: title,
		description: descriptionLines.join('\n'),
	});
}
