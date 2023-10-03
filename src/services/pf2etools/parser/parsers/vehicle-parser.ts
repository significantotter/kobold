import { KoboldEmbed } from '../../../../utils/kobold-embed-utils.js';
import { Vehicle } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseVehicle(
	this: CompendiumEmbedParser,
	vehicle: Vehicle
): Promise<KoboldEmbed> {
	const title = `${vehicle.name}`;
	const entryParser = new EntryParser(this.helpers, { delimiter: '\n\n' });
	const description = (vehicle.entries ?? []).map(entry => entryParser.parseEntry(entry));
	return new KoboldEmbed({
		title: title,
		description: description.join('\n'),
	});
}
