import { KoboldEmbed } from '../../../../utils/kobold-embed-utils.js';
import { Action } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseAction(
	this: CompendiumEmbedParser,
	ability: Action
): Promise<KoboldEmbed> {
	const title = `${ability.name} ${
		ability.activity ? this.helpers.parseActivity(ability.activity) : ''
	}`;
	const entryParser = new EntryParser(this.helpers, { delimiter: '\n\n' });
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
	return new KoboldEmbed({
		title: title,
		description: description.join('\n'),
	});
}
