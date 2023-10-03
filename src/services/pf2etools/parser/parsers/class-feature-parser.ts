import { KoboldEmbed } from '../../../../utils/kobold-embed-utils.js';
import { ClassFeature } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseClassFeature(
	this: CompendiumEmbedParser,
	classFeature: ClassFeature
): Promise<KoboldEmbed> {
	const entryParser = new EntryParser(this.helpers, { delimiter: '\n\n' });
	const title = `${classFeature.name} (${classFeature.className} ${classFeature.level})`;
	let descriptionLines: string[] = [];
	if (classFeature.subclasses) descriptionLines.push(`**Subclass:** ${classFeature.subclasses}`);
	descriptionLines.push(entryParser.parseEntries(classFeature.entries));
	return new KoboldEmbed({
		title: title,
		description: descriptionLines.join('\n\n'),
	});
}
