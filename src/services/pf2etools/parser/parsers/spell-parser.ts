import { KoboldEmbed } from '../../../../utils/kobold-embed-utils.js';
import { Spell } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseSpell(this: CompendiumEmbedParser, spell: Spell): Promise<KoboldEmbed> {
	const title = `${spell.name}`;
	const entryParser = new EntryParser(this.helpers, { delimiter: '\n\n' });
	const description = entryParser.parseEntries(spell.entries);
	return new KoboldEmbed({
		title: title,
		description: description,
	});
}
