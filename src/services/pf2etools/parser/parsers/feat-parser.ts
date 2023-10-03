import { KoboldEmbed } from '../../../../utils/kobold-embed-utils.js';
import { Feat } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseFeat(this: CompendiumEmbedParser, feat: Feat): Promise<KoboldEmbed> {
	const entryParser = new EntryParser(this.helpers, { delimiter: '\n\n' });
	const parsedFeat = entryParser.parseFeat(feat, false);
	return new KoboldEmbed({
		title: parsedFeat.name,
		description: parsedFeat.value,
	});
}
