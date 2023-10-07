import { EmbedData } from 'discord.js';
import { ClassFeature } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function _parseClassFeature(this: CompendiumEmbedParser, classFeature: ClassFeature) {
	const preprocessedData = (await this.preprocessData(classFeature)) as ClassFeature;
	return parseClassFeature.call(this, preprocessedData);
}

export function parseClassFeature(
	this: CompendiumEmbedParser,
	classFeature: ClassFeature
): EmbedData {
	const entryParser = new EntryParser({ delimiter: '\n', emojiConverter: this.emojiConverter });
	const title = `${classFeature.name} (${classFeature.className} ${classFeature.level})`;
	let descriptionLines: string[] = [];
	if (classFeature.subclasses) descriptionLines.push(`**Subclass:** ${classFeature.subclasses}`);
	descriptionLines.push(entryParser.parseEntries(classFeature.entries));
	return {
		title: title,
		description: descriptionLines.join('\n\n'),
	};
}
