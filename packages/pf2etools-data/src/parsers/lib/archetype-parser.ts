import { or } from 'drizzle-orm';
import type { EmbedData } from 'discord.js';
import type { Archetype, Feat } from '../../schemas/index.js';
import type { CompendiumEmbedParser } from '../compendium-parser.js';

import { DrizzleUtils } from '../../utils/drizzle-utils.js';

export async function _parseArchetype(this: CompendiumEmbedParser, archetype: Archetype) {
	const preprocessedData = (await this.preprocessData(archetype)) as Archetype;

	//archetype async work
	const targetExtraFeatNames: string[] = [];
	for (const extraFeat of archetype.extraFeats ?? []) {
		const [level, name, source] = extraFeat.split('|');
		targetExtraFeatNames.push(name);
	}

	const query = this.model.db.query.Feats.findMany({
		where: or(
			DrizzleUtils.ilike(this.model.feats.table.tags, `%${archetype.name}%`),
			...targetExtraFeatNames.map(name =>
				DrizzleUtils.ilike(this.model.feats.table.name, name)
			)
		),
	});

	const archetypeFeats = (await query)
		.map(featData => featData.data as Feat)
		.sort((a, b) => a.level - b.level);

	return parseArchetype.call(this, preprocessedData, archetypeFeats);
}

export function parseArchetype(
	this: CompendiumEmbedParser,
	archetype: Archetype,
	feats: Feat[]
): EmbedData {
	const title = `${archetype.name}`;
	const descriptionLines: string[] = [];
	if (archetype.rarity) descriptionLines.push(`**Rarity:** ${archetype.rarity}`);
	if (archetype.entries) descriptionLines.push(this.entryParser.parseEntries(archetype.entries));
	// Archetypes are very sparse and almost irrelevant without their feats. So we'll fetch their feats for our embed fields.

	return {
		title: title,
		description: descriptionLines.join('\n'),
		fields: feats ? feats.map(feat => this.entryParser.parseFeat(feat, false)) : undefined,
	};
}
