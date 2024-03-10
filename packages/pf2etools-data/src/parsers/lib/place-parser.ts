import type { EmbedData } from 'discord.js';
import type { Place } from '../../schemas/index.js';
import type { CompendiumEmbedParser } from '../compendium-parser.js';

import _ from 'lodash';

export async function _parsePlace(this: CompendiumEmbedParser, place: Place) {
	const preprocessedData = (await this.preprocessData(place)) as Place;
	return parsePlace.call(this, preprocessedData);
}

export function parsePlace(this: CompendiumEmbedParser, place: Place): EmbedData {
	const title = `${place.name} (${place.category} ${place.level ?? ''})`;

	const descriptionLines: string[] = [];
	descriptionLines.push(`**Traits** ${place.traits.join(', ')}`);
	if (place.description) descriptionLines.push(`${place.description}`);
	if (place.settlementData) {
		descriptionLines.push(`**Government** ${place.settlementData.government}`);
		descriptionLines.push(
			`**Population** ${place.settlementData.population.total} (${Object.entries(
				place.settlementData.population.ancestries
			)
				.map(([ancestryName, population]) => `${population}% ${ancestryName}`)
				.join(', ')})`
		);
		descriptionLines.push(`**Languages** ${place.settlementData.languages.join(', ')}`);

		descriptionLines.push(``);
		if (place.settlementData?.religions?.length)
			descriptionLines.push(`**Religions** ${place.settlementData.religions.join(', ')}`);
		if (place.settlementData?.threats?.length)
			descriptionLines.push(`**Threats** ${place.settlementData.threats.join(', ')}`);
		for (const feature of place.settlementData?.features ?? []) {
			descriptionLines.push(
				`**${feature.name}** ${this.entryParser.parseEntries(feature.entries)}`
			);
		}
	}
	if (place.nationData) {
		descriptionLines.push(`**Government** ${place.nationData.government}`);
		descriptionLines.push(`**Population** ${place.nationData.population.join(', ')}`);
		descriptionLines.push(`**Languages** ${place.nationData.languages.join(', ')}`);

		descriptionLines.push(``);
		if (place.nationData?.religions?.length)
			descriptionLines.push(
				`**Religions** ${place.nationData.religions
					.map(religion => {
						if (_.isString(religion)) return religion;
						else {
							return `**${religion.type}** ${religion.religions.join(', ')}`;
						}
					})
					.join(', ')}`
			);
		for (const feature of place.nationData?.features ?? []) {
			descriptionLines.push(
				`**${feature.name}** ${this.entryParser.parseEntries(feature.entries)}`
			);
		}

		descriptionLines.push(``);
		if (place.nationData.exports)
			descriptionLines.push(`**Primary Exports** ${place.nationData.exports.join(', ')}`);
		if (place.nationData.imports)
			descriptionLines.push(`**Primary Imports** ${place.nationData.imports.join(', ')}`);
		if (place.nationData.enemies)
			descriptionLines.push(`**Enemies** ${place.nationData.enemies.join(', ')}`);
		if (place.nationData.factions)
			descriptionLines.push(`**Factions** ${place.nationData.factions.join(', ')}`);
		if (place.nationData?.threats?.length)
			descriptionLines.push(`**Threats** ${place.nationData.threats.join(', ')}`);
	}
	if (place.planeData) {
		descriptionLines.push(`**Category** ${place.planeData.category}`);
		descriptionLines.push(`**Divinities** ${place.planeData.divinities.join(', ')}`);
		descriptionLines.push(`**Native Inhabitants** ${place.planeData.inhabitants.join(', ')}`);
	}
	descriptionLines.push(``);
	for (const resident of place.residents ?? []) {
		let traits = [
			resident.alignment,
			resident.gender === 'f' ? 'female' : resident.gender === 'm' ? 'male' : resident.gender,
			resident.ancestry,
			resident.position,
			resident.level,
		];
		descriptionLines.push(`**${resident.name}** (${traits.join(' ')}) ${resident.bond}`);
	}
	descriptionLines.push(``);
	if (place.entries) descriptionLines.push(this.entryParser.parseEntries(place.entries));

	return {
		title: title,
		description: descriptionLines.join('\n'),
	};
}
