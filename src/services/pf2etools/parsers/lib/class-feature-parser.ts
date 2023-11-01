import type { EmbedData } from 'discord.js';
import type { ClassFeature } from '../../schemas/index.js';
import type { CompendiumEmbedParser } from '../compendium-parser.js';

export async function _parseClassFeature(this: CompendiumEmbedParser, classFeature: ClassFeature) {
	const preprocessedData = (await this.preprocessData(classFeature)) as ClassFeature;
	return parseClassFeature.call(this, preprocessedData);
}

export function parseClassFeature(
	this: CompendiumEmbedParser,
	classFeature: ClassFeature
): EmbedData {
	const title = `${classFeature.name} (${classFeature.className} ${classFeature.level})`;
	let descriptionLines: string[] = [];
	if (classFeature.subclasses) descriptionLines.push(`**Subclass:** ${classFeature.subclasses}`);
	descriptionLines.push(this.entryParser.parseEntries(classFeature.entries));
	return {
		title: title,
		description: descriptionLines.join('\n\n'),
	};
}
