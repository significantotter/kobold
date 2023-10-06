import { EmbedData } from 'discord.js';
import { Familiar } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function _parseFamiliar(this: CompendiumEmbedParser, familiar: Familiar) {
	const preprocessedData = (await this.preprocessData(familiar)) as Familiar;
	return parseFamiliar.call(this, preprocessedData);
}

export function parseFamiliar(this: CompendiumEmbedParser, familiar: Familiar): EmbedData {
	const entryParser = new EntryParser({ delimiter: '\n', emojiConverter: this.emojiConverter });
	const title = `${familiar.name}`;
	const descriptionLines: string[] = [];
	if (familiar.requires)
		descriptionLines.push(`**Required Number of Abilities** ${familiar.requires}`);
	if (familiar.granted) {
		descriptionLines.push(`**Granted Abilities** ${familiar.granted.join(', ')}`);
	}
	descriptionLines.push(entryParser.parseEntries(familiar.fluff));
	const fields: { name: string; value: string }[] = [];
	for (const ability of familiar.abilities) {
		fields.push({
			name: entryParser.parseAbilityEntryTitle(ability),
			value: entryParser.parseAbilityEntry(ability, false),
		});
	}
	return {
		title: title,
		description: descriptionLines.join('\n'),
		fields,
	};
}
