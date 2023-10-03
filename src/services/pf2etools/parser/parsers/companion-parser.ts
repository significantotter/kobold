import { KoboldEmbed } from '../../../../utils/kobold-embed-utils.js';
import { Companion } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseCompanion(
	this: CompendiumEmbedParser,
	companion: Companion
): Promise<KoboldEmbed> {
	const title = `${companion.name}`;
	const descriptionLines: string[] = [];
	const entryParser = new EntryParser(this.helpers, { delimiter: '\n' });
	const inlineEntryParser = new EntryParser(this.helpers, { delimiter: ' ' });
	if (companion.fluff?.length) descriptionLines.push(entryParser.parseEntries(companion.fluff));
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

	return new KoboldEmbed({
		title: title,
		description: descriptionLines.join('\n'),
		fields: [
			{
				name: inlineEntryParser.parseAbilityEntryTitle(companion.maneuver),
				value: inlineEntryParser.parseAbilityEntry(companion.maneuver, false),
			},
		],
	});
}
