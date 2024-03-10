import type { EmbedData } from 'discord.js';
import type { Companion } from '../../schemas/index.js';
import type { CompendiumEmbedParser } from '../compendium-parser.js';

export async function _parseCompanion(this: CompendiumEmbedParser, companion: Companion) {
	const preprocessedData = (await this.preprocessData(companion)) as Companion;
	return parseCompanion.call(this, preprocessedData);
}

export function parseCompanion(this: CompendiumEmbedParser, companion: Companion): EmbedData {
	const title = `${companion.name}`;
	const descriptionLines: string[] = [];

	const inlineEntryParser = this.entryParser.withDelimiter(' ');
	if (companion.fluff?.length)
		descriptionLines.push(this.entryParser.parseEntries(companion.fluff));
	if (companion.access) descriptionLines.push(`**Access** ${companion.access}`);
	descriptionLines.push(`**Size** ${companion.size.join(' or ')}`);
	for (const attack of companion.attacks) {
		descriptionLines.push(inlineEntryParser.parseAttackEntry(attack));
	}
	const attributes = this.helpers.parseAttributes(companion.abilityMods);
	if (attributes.length) descriptionLines.push(attributes);
	descriptionLines.push(`**HP** ${companion.hp}`);
	descriptionLines.push(`**Skill** ${companion.skill}`);
	descriptionLines.push(
		`**Senses** ${(companion.senses?.other ?? [])
			?.concat(companion.senses?.imprecise ?? [])
			.join(',')}`
	);
	descriptionLines.push(this.helpers.parseSpeed(companion.speed));
	descriptionLines.push(`**Support Benefit** ${companion.support}`);
	descriptionLines.push(`**Advanced Maneuver** ${companion.maneuver.name}`);

	return {
		title: title,
		description: descriptionLines.join('\n'),
		fields: [
			{
				name: inlineEntryParser.parseAbilityEntryTitle(companion.maneuver),
				value: inlineEntryParser.parseAbilityEntry(companion.maneuver, false),
			},
		],
	};
}
