import { KoboldEmbed } from '../../../../utils/kobold-embed-utils.js';
import { Affliction } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';

export async function parseAffliction(
	this: CompendiumEmbedParser,
	affliction: Affliction
): Promise<KoboldEmbed> {
	const title = `${affliction.name}`;
	const description = this.entries.parseAfflictionEntry(affliction, false);
	return new KoboldEmbed({
		title: title,
		description: description,
	});
}
