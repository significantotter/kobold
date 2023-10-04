import { EmbedData } from 'discord.js';
import { Action } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseAction(
	this: CompendiumEmbedParser,
	ability: Action
): Promise<EmbedData> {
	const entryParser = new EntryParser({ delimiter: '\n\n', emojiConverter: this.emojiConverter });
	const title = `${ability.name} ${
		ability.activity ? entryParser.parseActivity(ability.activity) : ''
	}`;
	let description: string[] = [];
	if (ability.traits?.length) {
		description.push(`(${ability.traits.join(', ')})`);
	}
	if (ability.cost) {
		description.push(`**Cost:** ${ability.cost}`);
	}
	if (ability.prerequisites) {
		description.push(`**Prerequisites:** ${ability.prerequisites}`);
	}
	if (ability.requirements) {
		description.push(`**Requirements:** ${ability.requirements}`);
	}
	if (ability.frequency) {
		description.push(`${this.helpers.parseFrequency(ability.frequency)}`);
	}
	if (ability.trigger) {
		description.push(`**Trigger** ${ability.trigger}`);
	}
	if (ability.overcome) {
		description.push(`**Overcome** $(ability.overcome)}`);
	}
	if (ability.entries?.length) {
		description.push(entryParser.parseEntries(ability.entries));
	}
	if (ability.special?.length) {
		description.push(`**Special** ${ability.special.join(', ')}`);
	}
	return {
		title: title,
		description: description.join('\n'),
	};
}
