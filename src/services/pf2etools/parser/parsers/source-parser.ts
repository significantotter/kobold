import { KoboldEmbed } from '../../../../utils/kobold-embed-utils.js';
import { Source } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseSource(
	this: CompendiumEmbedParser,
	source: Source
): Promise<KoboldEmbed> {
	const title = `${source.name}`;
	const entryParser = new EntryParser(this.helpers, { delimiter: '\n\n' });
	const descriptionLines: string[] = [];
	if (source.entries) descriptionLines.push(entryParser.parseEntries(source.entries));
	return new KoboldEmbed({
		title: title,
		url: source.store,
		description: descriptionLines.join('\n'),
	});
}
