import { EmbedData } from 'discord.js';
import { Feat } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseFeat(this: CompendiumEmbedParser, feat: Feat): Promise<EmbedData> {
	const entryParser = new EntryParser({ delimiter: '\n\n', emojiConverter: this.emojiConverter });
	const parsedFeat = entryParser.parseFeat(feat, false);
	return {
		title: parsedFeat.name,
		description: parsedFeat.value,
	};
}
