import { EmbedData } from 'discord.js';
import { SubclassFeature } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseSubclassFeature(
	this: CompendiumEmbedParser,
	subclassFeature: SubclassFeature
): Promise<EmbedData> {
	const title = `${subclassFeature.name} (${subclassFeature.subclassShortName} ${subclassFeature.className} ${subclassFeature.level})`;
	let description = '';
	const entryParser = new EntryParser({ delimiter: '\n\n', emojiConverter: this.emojiConverter });
	description += entryParser.parseEntries(subclassFeature.entries);
	return {
		title: title,
		description: description,
	};
}
