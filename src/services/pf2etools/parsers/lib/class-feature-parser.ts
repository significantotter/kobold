import { EmbedData } from 'discord.js';
import { ClassFeature } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseClassFeature(
	this: CompendiumEmbedParser,
	classFeature: ClassFeature
): Promise<EmbedData> {
	const entryParser = new EntryParser({ delimiter: '\n\n', emojiConverter: this.emojiConverter });
	const title = `${classFeature.name} (${classFeature.className} ${classFeature.level})`;
	let descriptionLines: string[] = [];
	if (classFeature.subclasses) descriptionLines.push(`**Subclass:** ${classFeature.subclasses}`);
	descriptionLines.push(entryParser.parseEntries(classFeature.entries));
	return {
		title: title,
		description: descriptionLines.join('\n\n'),
	};
}
