import { KoboldEmbed } from '../../../../utils/kobold-embed-utils.js';
import { VersatileHeritage } from '../../models/index.js';
import { EntryParser } from '../compendium-entry-parser.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';

export async function parseVersatileHeritage(
	this: CompendiumEmbedParser,
	versatileHeritage: VersatileHeritage
): Promise<KoboldEmbed> {
	const title = `${versatileHeritage.name}`;
	const entryParser = new EntryParser(this.helpers, { delimiter: '\n\n' });
	const description = (versatileHeritage.entries ?? []).map(entry =>
		entryParser.parseEntry(entry)
	);
	return new KoboldEmbed({
		title: title,
		description: description.join('\n'),
	});
}
