import type { EmbedData } from 'discord.js';
import type { Feat } from '../../schemas/index.js';
import type { CompendiumEmbedParser } from '../compendium-parser.js';

export async function _parseFeat(this: CompendiumEmbedParser, feat: Feat) {
	const preprocessedData = (await this.preprocessData(feat)) as Feat;
	return parseFeat.call(this, preprocessedData);
}

export function parseFeat(this: CompendiumEmbedParser, feat: Feat): EmbedData {
	const parsedFeat = this.entryParser.parseFeat(feat, false);
	return {
		title: parsedFeat.name,
		description: parsedFeat.value,
	};
}
