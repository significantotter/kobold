import { EmbedData } from 'discord.js';
import { Group } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseGroup(this: CompendiumEmbedParser, group: Group): Promise<EmbedData> {
	const title = `${group.name} ${group.type}`;

	return {
		title: title,
		description: group.specialization.join('\n'),
	};
}
