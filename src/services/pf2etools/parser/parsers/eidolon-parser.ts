import { KoboldEmbed } from '../../../../utils/kobold-embed-utils.js';
import { Eidolon } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseEidolon(
	this: CompendiumEmbedParser,
	eidolon: Eidolon
): Promise<KoboldEmbed> {
	const title = `${eidolon.name}`;
	const descriptionLines: string[] = [];
	const entryParser = new EntryParser(this.helpers, { delimiter: '\n' });
	const inlineEntryParser = new EntryParser(this.helpers, { delimiter: ' ' });
	if (eidolon.fluff?.length) descriptionLines.push(entryParser.parseEntries(eidolon.fluff));
	descriptionLines.push(
		`**Tradition** ${eidolon.tradition + ' ' + (eidolon.traditionNote ?? '')}`
	);
	descriptionLines.push(`**Home Plane** ${eidolon.home}`);
	descriptionLines.push('');
	descriptionLines.push(`**Size** ${eidolon.size.join(' or ')}`);
	descriptionLines.push(`**Suggested Attacks** ${eidolon.suggestedAttacks.join(', ')}`);
	for (const abilitySet of eidolon.stats) {
		const attributes = this.helpers.parseAttributes(abilitySet.abilityScores);
		const ac = `${abilitySet.ac.number >= 0 ? '+' : ''}${abilitySet.ac.number} (+${
			abilitySet.ac.dexCap
		} Dex Cap)`;
		descriptionLines.push(`**${abilitySet.name}** ${attributes} ${ac}`);
	}
	descriptionLines.push(`**Skills** ${eidolon.skills.join(', ')}`);
	descriptionLines.push(`**Senses** ${eidolon.senses.other.join(',')}`);
	descriptionLines.push(`**Languages** ${eidolon.languages.join(',')}`);
	descriptionLines.push(this.helpers.parseSpeed(eidolon.speed));
	descriptionLines.push(
		`**Eidolon Abilities** ${eidolon.abilities
			.map(ability => `*${ability.type}* ${ability.name}`)
			.join('; ')}`
	);

	const fields = eidolon.abilities.map(ability => {
		return {
			name: `${ability.name} (*${ability.type}*)`,
			value: inlineEntryParser.parseEntry(ability, false),
		};
	});

	return new KoboldEmbed({
		title: title,
		description: descriptionLines.join('\n'),
		fields: fields,
	});
}
