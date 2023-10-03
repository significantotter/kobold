import { KoboldEmbed } from '../../../../utils/kobold-embed-utils.js';
import { QuickRule } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseQuickRule(
	this: CompendiumEmbedParser,
	quickRule: QuickRule
): Promise<KoboldEmbed> {
	const title = `${quickRule.name}`;
	const entryParser = new EntryParser(this.helpers, { delimiter: '\n\n' });
	const description = entryParser.parseEntry(quickRule.rule);
	return new KoboldEmbed({
		title: title,
		description: description,
	});
}
