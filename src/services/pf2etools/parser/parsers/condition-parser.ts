import { KoboldEmbed } from '../../../../utils/kobold-embed-utils.js';
import { Condition } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseCondition(
	this: CompendiumEmbedParser,
	condition: Condition
): Promise<KoboldEmbed> {
	const entryParser = new EntryParser(this.helpers, { delimiter: '\n\n' });
	const title = `${condition.name}`;
	const description = entryParser.parseEntries(condition.entries);
	return new KoboldEmbed({
		title: title,
		description: description,
	});
}
