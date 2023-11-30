import type { EmbedData } from 'discord.js';
import type { Action } from '../../schemas/index.js';
import type { CompendiumEmbedParser } from '../compendium-parser.js';

export async function _parseAction(this: CompendiumEmbedParser, ability: Action) {
	const preprocessedData = (await this.preprocessData(ability)) as Action;
	return parseAction.call(this, preprocessedData);
}
export function parseAction(this: CompendiumEmbedParser, ability: Action): EmbedData {
	const title = `${ability.name} ${
		ability.activity ? this.entryParser.parseActivity(ability.activity) : ''
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
		description.push(`**Overcome** ${ability.overcome}`);
	}
	if (ability.entries?.length) {
		description.push(this.entryParser.parseEntries(ability.entries));
	}
	if (ability.special?.length) {
		description.push(`**Special** ${ability.special.join(', ')}`);
	}
	return {
		title: title,
		description: description.join('\n'),
	};
}
