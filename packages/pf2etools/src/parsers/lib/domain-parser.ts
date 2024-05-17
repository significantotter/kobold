import type { EmbedData } from 'discord.js';
import type { Deity, Domain, Spell } from '../../schemas/index.js';
import type { CompendiumEmbedParser } from '../compendium-parser.js';

import { DrizzleUtils } from '../../utils/drizzle-utils.js';

export async function _parseDomain(this: CompendiumEmbedParser, domain: Domain) {
	const preprocessedData = (await this.preprocessData(domain)) as Domain;

	// Domain async work
	// fetch domains and domain spells to display
	const domainSpells = (
		await this.model.db.query.Spells.findMany({
			where: DrizzleUtils.ilike(this.model.spells.table.tags, `%domain-${domain.name}%`),
		})
	).map(spellData => spellData.data as Spell);
	const domainDeities = (
		await this.model.db.query.Deities.findMany({
			where: DrizzleUtils.ilike(this.model.deities.table.tags, `%domain-${domain.name}%`),
		})
	).map(deityData => deityData.data as Deity);

	return parseDomain.call(this, preprocessedData, domainDeities, domainSpells);
}

export function parseDomain(
	this: CompendiumEmbedParser,
	domain: Domain,
	relatedDeities: Deity[],
	relatedSpells: Spell[]
): EmbedData {
	const title = `${domain.name} Domain`;
	const descriptionLines: string[] = [];

	if (relatedDeities?.length) {
		descriptionLines.push(`**Deities:** ${relatedDeities.map(deity => deity.name).join(', ')}`);
	}
	if (relatedSpells?.length) {
		descriptionLines.push(`**Domain Spell:** ${relatedSpells[0].name}`);
		if (relatedSpells[1]) {
			descriptionLines.push(`**Advanced Domain Spell:** ${relatedSpells[1].name}`);
		}
	}

	descriptionLines.push(this.entryParser.parseEntries(domain.entries));

	return {
		title: title,
		description: descriptionLines.join('\n'),
	};
}
