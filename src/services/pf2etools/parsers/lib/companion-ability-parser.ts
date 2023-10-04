import { EmbedData } from 'discord.js';
import { CompanionAbility } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseCompanionAbility(
	this: CompendiumEmbedParser,
	companionAbility: CompanionAbility
): Promise<EmbedData> {
	const title = `${companionAbility.name}`;
	const entryParser = new EntryParser({ delimiter: '\n\n', emojiConverter: this.emojiConverter });
	const description = entryParser.parseEntries(companionAbility.entries);
	return {
		title: title,
		description,
	};
}
