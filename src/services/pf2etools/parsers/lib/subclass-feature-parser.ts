import { EmbedData } from 'discord.js';
import { SubclassFeature } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function _parseSubclassFeature(
	this: CompendiumEmbedParser,
	subclassFeature: SubclassFeature
) {
	const preprocessedData = (await this.preprocessData(subclassFeature)) as SubclassFeature;
	return parseSubclassFeature.call(this, preprocessedData);
}

export function parseSubclassFeature(
	this: CompendiumEmbedParser,
	subclassFeature: SubclassFeature
): EmbedData {
	const title = `${subclassFeature.name} (${subclassFeature.subclassShortName} ${subclassFeature.className} ${subclassFeature.level})`;
	let description = '';
	const entryParser = new EntryParser({ delimiter: '\n\n', emojiConverter: this.emojiConverter });
	description += entryParser.parseEntries(subclassFeature.entries);
	return {
		title: title,
		description: description,
	};
}
