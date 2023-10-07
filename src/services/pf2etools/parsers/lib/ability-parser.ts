import { EmbedData } from 'discord.js';
import { Ability } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function _parseAbility(this: CompendiumEmbedParser, ability: Ability) {
	const preprocessedData = (await this.preprocessData(ability)) as Ability;
	return parseAbility.call(this, preprocessedData);
}

export function parseAbility(this: CompendiumEmbedParser, ability: Ability): EmbedData {
	const entryParser = new EntryParser({ delimiter: '\n', emojiConverter: this.emojiConverter });
	const title = `${ability.name} ${
		ability.activity ? entryParser.parseActivity(ability.activity) : ''
	}`;
	const description = entryParser.parseAbilityEntry(ability, false);
	return {
		title: title,
		description: description,
	};
}
