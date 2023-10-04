import { EmbedData } from 'discord.js';
import { Skill } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseSkill(this: CompendiumEmbedParser, skill: Skill): Promise<EmbedData> {
	const title = `${skill.name}`;
	const entryParser = new EntryParser({ delimiter: '\n\n', emojiConverter: this.emojiConverter });
	const description = entryParser.parseEntries(skill.entries);
	return {
		title: title,
		description: description,
	};
}
