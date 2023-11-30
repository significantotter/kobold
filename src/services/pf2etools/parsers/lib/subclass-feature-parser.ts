import type { EmbedData } from 'discord.js';
import type { SubclassFeature } from '../../schemas/index.js';
import type { CompendiumEmbedParser } from '../compendium-parser.js';

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

	description += this.entryParser.parseEntries(subclassFeature.entries);
	return {
		title: title,
		description: description,
	};
}
