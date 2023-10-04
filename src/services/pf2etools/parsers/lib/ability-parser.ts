import { EmbedData } from 'discord.js';
import { Ability } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseAbility(
	this: CompendiumEmbedParser,
	ability: Ability
): Promise<EmbedData> {
	const entryParser = new EntryParser({ delimiter: '\n\n', emojiConverter: this.emojiConverter });
	const title = `${ability.name} ${
		ability.activity ? entryParser.parseActivity(ability.activity) : ''
	}`;
	const description = entryParser.parseAbilityEntry(ability, false);
	return {
		title: title,
		description: description,
	};
}
