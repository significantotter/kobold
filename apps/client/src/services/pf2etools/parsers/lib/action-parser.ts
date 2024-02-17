import type { EmbedData } from 'discord.js';
import type { Action } from '../../schemas/index.js';
import type { CompendiumEmbedParser } from '../compendium-parser.js';

export async function _parseAction(this: CompendiumEmbedParser, action: Action) {
	const preprocessedData = (await this.preprocessData(action)) as Action;
	return parseAction.call(this, preprocessedData);
}
export function parseAction(this: CompendiumEmbedParser, action: Action): EmbedData {
	const title = `${action.name} ${
		action.activity ? this.entryParser.parseActivity(action.activity) : ''
	}`;
	let description: string[] = [];
	if (action.traits?.length) {
		description.push(`(${action.traits.join(', ')})`);
	}
	if (action.cost) {
		description.push(`**Cost:** ${action.cost}`);
	}
	if (action.prerequisites) {
		description.push(`**Prerequisites:** ${action.prerequisites}`);
	}
	if (action.requirements) {
		description.push(`**Requirements:** ${action.requirements}`);
	}
	if (action.frequency) {
		description.push(`${this.helpers.parseFrequency(action.frequency)}`);
	}
	if (action.trigger) {
		description.push(`**Trigger** ${action.trigger}`);
	}
	if (action.overcome) {
		description.push(`**Overcome** ${action.overcome}`);
	}
	if (action.entries?.length) {
		description.push(this.entryParser.parseEntries(action.entries));
	}
	if (action.special?.length) {
		description.push(`**Special** ${action.special.join(', ')}`);
	}
	return {
		title: title,
		description: description.join('\n'),
	};
}
