import { KoboldEmbed } from '../../../../utils/kobold-embed-utils.js';
import { Ability, Affliction, CreatureTemplate } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

const abilityIsAffliction = (ability: Ability | Affliction): ability is Affliction =>
	ability.type === 'affliction' || ability.type === 'Disease' || ability.type === 'Curse';

export async function parseCreatureTemplate(
	this: CompendiumEmbedParser,
	creatureTemplate: CreatureTemplate
): Promise<KoboldEmbed> {
	const entryParser = new EntryParser(this.helpers, { delimiter: '\n\n' });
	const title = `${creatureTemplate.name}`;
	const descriptionLines = [];
	descriptionLines.push(entryParser.parseEntries(creatureTemplate.entries));
	const genericAbilities: string[] = [];
	const fields: { name: string; value: string; inline: boolean }[] = [];
	if (creatureTemplate.abilities?.entries) {
		descriptionLines.push(entryParser.parseEntries(creatureTemplate.abilities.entries));
	}
	for (const ability of creatureTemplate.abilities?.abilities ?? []) {
		if (abilityIsAffliction(ability)) {
			fields.push({
				name: `**${ability.name ?? 'Affliction'}**`,
				value: entryParser.parseAfflictionEntry(ability, false),
				inline: true,
			});
		} else {
			if (ability.generic) {
				genericAbilities.push(ability.name ?? 'Ability');
			} else {
				fields.push({
					name: entryParser.parseAbilityEntryTitle(ability),
					value: entryParser.parseAbilityEntry(ability, false),
					inline: true,
				});
			}
		}
	}
	if (creatureTemplate.optAbilities?.entries) {
		fields.push({
			name: '**Optional Abilities**',
			value: entryParser.parseEntries(creatureTemplate.optAbilities.entries),
			inline: false,
		});
	}
	for (const ability of creatureTemplate.optAbilities?.abilities ?? []) {
		if (abilityIsAffliction(ability)) {
			fields.push({
				name: `**${ability.name ?? 'Ability'}**`,
				value: entryParser.parseAfflictionEntry(ability),
				inline: true,
			});
		} else {
			if (!ability.generic) {
				fields.push({
					name: entryParser.parseAbilityEntryTitle(ability),
					value: entryParser.parseAbilityEntry(ability, false),
					inline: true,
				});
			}
		}
	}
	descriptionLines.push(`Generic Abilities: ${genericAbilities.map(a => `**${a}**`).join(', ')}`);
	return new KoboldEmbed({
		title: title,
		description: descriptionLines.join('\n\n'),
		fields,
	});
}
