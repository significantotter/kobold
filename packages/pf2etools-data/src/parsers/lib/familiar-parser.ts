import type { EmbedData } from 'discord.js';
import type { Familiar } from '../../schemas/index.js';
import type { CompendiumEmbedParser } from '../compendium-parser.js';

export async function _parseFamiliar(this: CompendiumEmbedParser, familiar: Familiar) {
	const preprocessedData = (await this.preprocessData(familiar)) as Familiar;
	return parseFamiliar.call(this, preprocessedData);
}

export function parseFamiliar(this: CompendiumEmbedParser, familiar: Familiar): EmbedData {
	const title = `${familiar.name}`;
	const descriptionLines: string[] = [];
	if (familiar.requires)
		descriptionLines.push(`**Required Number of Abilities** ${familiar.requires}`);
	if (familiar.granted) {
		descriptionLines.push(`**Granted Abilities** ${familiar.granted.join(', ')}`);
	}
	descriptionLines.push(this.entryParser.parseEntries(familiar.fluff));
	const fields: { name: string; value: string }[] = [];
	for (const ability of familiar.abilities) {
		fields.push({
			name: this.entryParser.parseAbilityEntryTitle(ability),
			value: this.entryParser.parseAbilityEntry(ability, false),
		});
	}
	return {
		title: title,
		description: descriptionLines.join('\n'),
		fields,
	};
}
