import { KoboldEmbed } from '../../../../utils/kobold-embed-utils.js';
import { CompanionAbility } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseCompanionAbility(
	this: CompendiumEmbedParser,
	companionAbility: CompanionAbility
): Promise<KoboldEmbed> {
	const title = `${companionAbility.name}`;
	const entryParser = new EntryParser(this.helpers, { delimiter: '\n\n' });
	const description = entryParser.parseEntries(companionAbility.entries);
	return new KoboldEmbed({
		title: title,
		description,
	});
}
