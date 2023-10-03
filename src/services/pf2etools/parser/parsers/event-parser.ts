import { KoboldEmbed } from '../../../../utils/kobold-embed-utils.js';
import { Event } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseEvent(this: CompendiumEmbedParser, event: Event): Promise<KoboldEmbed> {
	const entryParser = new EntryParser(this.helpers, { delimiter: '\n\n' });
	const title = `${event.name} (Event ${event.level})`;
	const descriptionLines: string[] = [];
	if (event.traits) descriptionLines.push(`**Traits:** ${event.traits.join(', ')}`);
	descriptionLines.push(`**Applicable Skills:** ${event.applicableSkills.join(', ')}`);
	descriptionLines.push(entryParser.parseEntries(event.entries));

	return new KoboldEmbed({
		title: title,
		description: descriptionLines.join('\n'),
	});
}
