import { EmbedData } from 'discord.js';
import { Eidolon } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function _parseEidolon(this: CompendiumEmbedParser, eidolon: Eidolon) {
	const preprocessedData = (await this.preprocessData(eidolon)) as Eidolon;
	return parseEidolon.call(this, preprocessedData);
}

export function parseEidolon(this: CompendiumEmbedParser, eidolon: Eidolon): EmbedData {
	const title = `${eidolon.name}`;
	const descriptionLines: string[] = [];
	const entryParser = new EntryParser({ delimiter: '\n', emojiConverter: this.emojiConverter });
	const inlineEntryParser = new EntryParser({
		delimiter: ' ',
		emojiConverter: this.emojiConverter,
	});
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

	return {
		title: title,
		description: descriptionLines.join('\n'),
		fields: fields,
	};
}
