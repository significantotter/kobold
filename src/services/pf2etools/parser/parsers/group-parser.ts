import { KoboldEmbed } from '../../../../utils/kobold-embed-utils.js';
import { Group } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseGroup(this: CompendiumEmbedParser, group: Group): Promise<KoboldEmbed> {
	const title = `${group.name} ${group.type}`;

	return new KoboldEmbed({
		title: title,
		description: group.specialization.join('\n'),
	});
}
