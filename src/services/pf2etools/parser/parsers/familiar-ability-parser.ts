import { KoboldEmbed } from '../../../../utils/kobold-embed-utils.js';
import { FamiliarAbility } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseFamiliarAbility(
	this: CompendiumEmbedParser,
	familiarAbility: FamiliarAbility
): Promise<KoboldEmbed> {
	const entryParser = new EntryParser(this.helpers, { delimiter: '\n\n' });
	const title = `${familiarAbility.name}`;
	const descriptionLines: string[] = [];
	descriptionLines.push(`**Ability Type** ${familiarAbility.type}`);
	descriptionLines.push(entryParser.parseEntries(familiarAbility.entries));
	return new KoboldEmbed({
		title: title,
		description: descriptionLines.join('\n'),
	});
}
