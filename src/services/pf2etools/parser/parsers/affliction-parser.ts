import { KoboldEmbed } from '../../../../utils/kobold-embed-utils.js';
import { Affliction } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseAffliction(
	this: CompendiumEmbedParser,
	affliction: Affliction
): Promise<KoboldEmbed> {
	const entryParser = new EntryParser(this.helpers, { delimiter: '\n\n' });
	const title = `${affliction.name}`;
	const description = entryParser.parseAfflictionEntry(affliction, false);
	return new KoboldEmbed({
		title: title,
		description: description,
	});
}
