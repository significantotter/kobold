import { KoboldEmbed } from '../../../../utils/kobold-embed-utils.js';
import { Ability } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseAbility(
	this: CompendiumEmbedParser,
	ability: Ability
): Promise<KoboldEmbed> {
	const title = `${ability.name} ${
		ability.activity ? this.helpers.parseActivity(ability.activity) : ''
	}`;
	const entryParser = new EntryParser(this.helpers, { delimiter: '\n\n' });
	const description = entryParser.parseAbilityEntry(ability, false);
	return new KoboldEmbed({
		title: title,
		description: description,
	});
}
