import { EmbedData } from 'discord.js';
import { Event } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function _parseEvent(this: CompendiumEmbedParser, event: Event) {
	const preprocessedData = (await this.preprocessData(event)) as Event;
	return parseEvent.call(this, preprocessedData);
}

export function parseEvent(this: CompendiumEmbedParser, event: Event): EmbedData {
	const entryParser = new EntryParser({ delimiter: '\n\n', emojiConverter: this.emojiConverter });
	const title = `${event.name} (Event ${event.level})`;
	const descriptionLines: string[] = [];
	if (event.traits) descriptionLines.push(`**Traits:** ${event.traits.join(', ')}`);
	descriptionLines.push(`**Applicable Skills:** ${event.applicableSkills.join(', ')}`);
	descriptionLines.push(entryParser.parseEntries(event.entries));

	return {
		title: title,
		description: descriptionLines.join('\n'),
	};
}