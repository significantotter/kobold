import { KoboldEmbed } from '../../../../utils/kobold-embed-utils.js';
import { Trait } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseTrait(this: CompendiumEmbedParser, trait: Trait): Promise<KoboldEmbed> {
	const title = `${trait.name}`;
	const entryParser = new EntryParser(this.helpers, { delimiter: '\n\n' });
	const description = entryParser.parseEntries(trait.entries);
	return new KoboldEmbed({
		title: title,
		description: description,
	});
}
