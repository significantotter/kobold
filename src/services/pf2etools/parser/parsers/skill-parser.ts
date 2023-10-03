import { KoboldEmbed } from '../../../../utils/kobold-embed-utils.js';
import { Skill } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseSkill(this: CompendiumEmbedParser, skill: Skill): Promise<KoboldEmbed> {
	const title = `${skill.name}`;
	const entryParser = new EntryParser(this.helpers, { delimiter: '\n\n' });
	const description = entryParser.parseEntries(skill.entries);
	return new KoboldEmbed({
		title: title,
		description: description,
	});
}
