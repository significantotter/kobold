import { EmbedData } from 'discord.js';
import { CompanionAbility } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function _parseCompanionAbility(
	this: CompendiumEmbedParser,
	companionAbility: CompanionAbility
) {
	const preprocessedData = (await this.preprocessData(companionAbility)) as CompanionAbility;
	return parseCompanionAbility.call(this, preprocessedData);
}

export function parseCompanionAbility(
	this: CompendiumEmbedParser,
	companionAbility: CompanionAbility
): EmbedData {
	const title = `${companionAbility.name}`;
	const entryParser = new EntryParser({ delimiter: '\n', emojiConverter: this.emojiConverter });
	const description = entryParser.parseEntries(companionAbility.entries);
	return {
		title: title,
		description,
	};
}
