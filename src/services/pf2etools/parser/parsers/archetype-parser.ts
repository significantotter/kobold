import { or } from 'drizzle-orm';
import { KoboldEmbed } from '../../../../utils/kobold-embed-utils.js';
import { Archetype, Feat } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';
import { DrizzleUtils } from '../../utils/drizzle-utils.js';

export async function parseArchetype(
	this: CompendiumEmbedParser,
	archetype: Archetype
): Promise<KoboldEmbed> {
	const entryParser = new EntryParser(this.helpers, { delimiter: '\n\n' });
	const title = `${archetype.name}`;
	const descriptionLines: string[] = [];
	if (archetype.rarity) descriptionLines.push(`**Rarity:** ${archetype.rarity}`);
	if (archetype.entries) descriptionLines.push(entryParser.parseEntries(archetype.entries));
	// Archetypes are very sparse and almost irrelevant without their feats. So we'll fetch their feats for our embed fields.
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

	return new KoboldEmbed({
		title: title,
		description: descriptionLines.join('\n'),
		fields: archetypeFeats.map(feat => entryParser.parseFeat(feat, false)),
	});
}
