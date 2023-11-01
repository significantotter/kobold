import type { EmbedData } from 'discord.js';
import type { Ability } from '../../schemas/index.js';
import type { CompendiumEmbedParser } from '../compendium-parser.js';

export async function _parseAbility(this: CompendiumEmbedParser, ability: Ability) {
	const preprocessedData = (await this.preprocessData(ability)) as Ability;
	return parseAbility.call(this, preprocessedData);
}

export function parseAbility(this: CompendiumEmbedParser, ability: Ability): EmbedData {
	const title = `${ability.name} ${
		ability.activity ? this.entryParser.parseActivity(ability.activity) : ''
	}`;
	const description = this.entryParser.parseAbilityEntry(ability, false);
	return {
		title: title,
		description: description,
	};
}
