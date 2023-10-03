import { KoboldEmbed } from '../../../../utils/kobold-embed-utils.js';
import { VariantRule } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseVariantRule(
	this: CompendiumEmbedParser,
	variantRule: VariantRule
): Promise<KoboldEmbed> {
	const title = `${variantRule.name}`;
	const entryParser = new EntryParser(this.helpers, { delimiter: '\n\n' });
	const description = entryParser.parseEntries(variantRule.entries);
	return new KoboldEmbed({
		title: title,
		description: description,
	});
}
