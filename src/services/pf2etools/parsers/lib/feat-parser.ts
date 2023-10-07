import { EmbedData } from 'discord.js';
import { Feat } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function _parseFeat(this: CompendiumEmbedParser, feat: Feat) {
	const preprocessedData = (await this.preprocessData(feat)) as Feat;
	return parseFeat.call(this, preprocessedData);
}

export function parseFeat(this: CompendiumEmbedParser, feat: Feat): EmbedData {
	const entryParser = new EntryParser({ delimiter: '\n', emojiConverter: this.emojiConverter });
	const parsedFeat = entryParser.parseFeat(feat, false);
	return {
		title: parsedFeat.name,
		description: parsedFeat.value,
	};
}
