import type { EmbedData } from 'discord.js';
import type { Affliction } from '../../schemas/index.js';
import type { CompendiumEmbedParser } from '../compendium-parser.js';

export async function _parseAffliction(this: CompendiumEmbedParser, affliction: Affliction) {
	const preprocessedData = (await this.preprocessData(affliction)) as Affliction;
	return parseAffliction.call(this, preprocessedData);
}

export function parseAffliction(this: CompendiumEmbedParser, affliction: Affliction): EmbedData {
	const title = `${affliction.name}`;
	const description = this.entryParser.parseAfflictionEntry(affliction, false);
	return {
		title: title,
		description: description,
	};
}
