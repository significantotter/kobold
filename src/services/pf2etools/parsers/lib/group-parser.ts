import { EmbedData } from 'discord.js';
import { Group } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function _parseGroup(this: CompendiumEmbedParser, group: Group) {
	const preprocessedData = (await this.preprocessData(group)) as Group;
	return parseGroup.call(this, preprocessedData);
}

export function parseGroup(this: CompendiumEmbedParser, group: Group): EmbedData {
	const title = `${group.name} ${group.type}`;

	return {
		title: title,
		description: group.specialization.join('\n'),
	};
}
