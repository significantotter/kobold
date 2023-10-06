import { EmbedData } from 'discord.js';
import { FamiliarAbility } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function _parseFamiliarAbility(
	this: CompendiumEmbedParser,
	familiarAbility: FamiliarAbility
) {
	const preprocessedData = (await this.preprocessData(familiarAbility)) as FamiliarAbility;
	return parseFamiliarAbility.call(this, preprocessedData);
}

export function parseFamiliarAbility(
	this: CompendiumEmbedParser,
	familiarAbility: FamiliarAbility
): EmbedData {
	const entryParser = new EntryParser({ delimiter: '\n\n', emojiConverter: this.emojiConverter });
	const title = `${familiarAbility.name}`;
	const descriptionLines: string[] = [];
	descriptionLines.push(`**Ability Type** ${familiarAbility.type}`);
	descriptionLines.push(entryParser.parseEntries(familiarAbility.entries));
	return {
		title: title,
		description: descriptionLines.join('\n'),
	};
}
