import { EmbedData } from 'discord.js';
import { FamiliarAbility } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseFamiliarAbility(
	this: CompendiumEmbedParser,
	familiarAbility: FamiliarAbility
): Promise<EmbedData> {
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
