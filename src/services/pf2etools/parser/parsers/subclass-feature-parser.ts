import { KoboldEmbed } from '../../../../utils/kobold-embed-utils.js';
import { SubclassFeature } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseSubclassFeature(
	this: CompendiumEmbedParser,
	subclassFeature: SubclassFeature
): Promise<KoboldEmbed> {
	const title = `${subclassFeature.name} (${subclassFeature.subclassShortName} ${subclassFeature.className} ${subclassFeature.level})`;
	let description = '';
	const entryParser = new EntryParser(this.helpers, { delimiter: '\n\n' });
	description += entryParser.parseEntries(subclassFeature.entries);
	return new KoboldEmbed({
		title: title,
		description: description,
	});
}
