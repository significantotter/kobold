import type { EmbedData } from 'discord.js';
import type { Event } from '../../schemas/index.js';
import type { CompendiumEmbedParser } from '../compendium-parser.js';

export async function _parseEvent(this: CompendiumEmbedParser, event: Event) {
	const preprocessedData = (await this.preprocessData(event)) as Event;
	return parseEvent.call(this, preprocessedData);
}

export function parseEvent(this: CompendiumEmbedParser, event: Event): EmbedData {
	const title = `${event.name} (Event ${event.level})`;
	const descriptionLines: string[] = [];
	if (event.traits) descriptionLines.push(`**Traits:** ${event.traits.join(', ')}`);
	descriptionLines.push(`**Applicable Skills:** ${event.applicableSkills.join(', ')}`);
	descriptionLines.push(this.entryParser.parseEntries(event.entries));

	return {
		title: title,
		description: descriptionLines.join('\n'),
	};
}
