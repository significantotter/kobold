import { EmbedData } from 'discord.js';
import { Skill } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function _parseSkill(this: CompendiumEmbedParser, skill: Skill) {
	const preprocessedData = (await this.preprocessData(skill)) as Skill;
	return parseSkill.call(this, preprocessedData);
}

export function parseSkill(this: CompendiumEmbedParser, skill: Skill): EmbedData {
	const title = `${skill.name}`;
	const entryParser = new EntryParser({ delimiter: '\n\n', emojiConverter: this.emojiConverter });
	const description = entryParser.parseEntries(skill.entries);
	return {
		title: title,
		description: description,
	};
}
