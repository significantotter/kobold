import { KoboldEmbed } from '../../../../utils/kobold-embed-utils.js';
import { Background } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseBackground(
	this: CompendiumEmbedParser,
	background: Background
): Promise<KoboldEmbed> {
	const entryParser = new EntryParser(this.helpers, { delimiter: '\n\n' });
	const title = `${background.name}`;
	const descriptionLines = [];
	if (background.traits) descriptionLines.push(`**Traits:** ${background.traits.join(', ')}`);
	descriptionLines.push(entryParser.parseEntries(background.entries));
	return new KoboldEmbed({
		title: title,
		description: descriptionLines.join('\n\n'),
	});
}
