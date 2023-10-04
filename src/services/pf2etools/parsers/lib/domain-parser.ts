import { EmbedData } from 'discord.js';
import { Domain } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';
import { DrizzleUtils } from '../../utils/drizzle-utils.js';

export async function parseDomain(this: CompendiumEmbedParser, domain: Domain): Promise<EmbedData> {
	const entryParser = new EntryParser({ delimiter: '\n\n', emojiConverter: this.emojiConverter });
	const title = `${domain.name} Domain`;
	const descriptionLines: string[] = [];

	// fetch domains and domain spells to display
	const domainSpells = await this.model.db.query.Spells.findMany({
		where: DrizzleUtils.ilike(this.model.spells.table.tags, `%domain-${domain.name}%`),
	});
	const domainDeities = await this.model.db.query.Deities.findMany({
		where: DrizzleUtils.ilike(this.model.deities.table.tags, `%domain-${domain.name}%`),
	});
	if (domainDeities?.length) {
		descriptionLines.push(`**Deities:** ${domainDeities.map(deity => deity.name).join(', ')}`);
	}
	if (domainSpells?.length) {
		descriptionLines.push(`**Domain Spell:** ${domainSpells[0].name}`);
		if (domainSpells[1]) {
			descriptionLines.push(`**Advanced Domain Spell:** ${domainSpells[1].name}`);
		}
	}
	descriptionLines.push(entryParser.parseEntries(domain.entries));

	return {
		title: title,
		description: descriptionLines.join('\n'),
	};
}
