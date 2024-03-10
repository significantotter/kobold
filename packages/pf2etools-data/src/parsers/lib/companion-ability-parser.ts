import type { EmbedData } from 'discord.js';
import type { CompanionAbility } from '../../schemas/index.js';
import type { CompendiumEmbedParser } from '../compendium-parser.js';

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

	const description = this.entryParser.parseEntries(companionAbility.entries);
	return {
		title: title,
		description,
	};
}
