import type { EmbedData } from 'discord.js';
import type { Skill } from '../../schemas/index.js';
import type { CompendiumEmbedParser } from '../compendium-parser.js';

export async function _parseSkill(this: CompendiumEmbedParser, skill: Skill) {
	const preprocessedData = (await this.preprocessData(skill)) as Skill;
	return parseSkill.call(this, preprocessedData);
}

export function parseSkill(this: CompendiumEmbedParser, skill: Skill): EmbedData {
	const title = `${skill.name}`;

	const description = this.entryParser.parseEntries(skill.entries);
	return {
		title: title,
		description: description,
	};
}
