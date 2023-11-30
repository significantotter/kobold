import type { EmbedData } from 'discord.js';
import type { FamiliarAbility } from '../../schemas/index.js';
import type { CompendiumEmbedParser } from '../compendium-parser.js';

export async function _parseFamiliarAbility(
	this: CompendiumEmbedParser,
	familiarAbility: FamiliarAbility
) {
	const preprocessedData = (await this.preprocessData(familiarAbility)) as FamiliarAbility;
	return parseFamiliarAbility.call(this, preprocessedData);
}

export function parseFamiliarAbility(
	this: CompendiumEmbedParser,
	familiarAbility: FamiliarAbility
): EmbedData {
	const title = `${familiarAbility.name}`;
	const descriptionLines: string[] = [];
	descriptionLines.push(`**Ability Type** ${familiarAbility.type}`);
	descriptionLines.push(this.entryParser.parseEntries(familiarAbility.entries));
	return {
		title: title,
		description: descriptionLines.join('\n'),
	};
}
