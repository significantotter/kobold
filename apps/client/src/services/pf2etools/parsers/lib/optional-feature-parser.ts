import type { EmbedData } from 'discord.js';
import type { OptionalFeature } from '../../schemas/index.js';
import type { CompendiumEmbedParser } from '../compendium-parser.js';

import { nth } from '../compendium-parser-helpers.js';

export async function _parseOptionalFeature(
	this: CompendiumEmbedParser,
	optionalFeature: OptionalFeature
) {
	const preprocessedData = (await this.preprocessData(optionalFeature)) as OptionalFeature;
	return parseOptionalFeature.call(this, preprocessedData);
}

export function parseOptionalFeature(
	this: CompendiumEmbedParser,
	optionalFeature: OptionalFeature
): EmbedData {
	const title = `${optionalFeature.name}`;

	const descriptionLines: string[] = [];
	if (optionalFeature.traits)
		descriptionLines.push(`**Traits** ${optionalFeature.traits.join(', ')}`);
	if (optionalFeature.prerequisite) {
		let prerequisiteLine: string[] = [];
		for (const prereq of optionalFeature.prerequisite) {
			if (prereq?.level?.level) {
				prerequisiteLine.push(`Level ${nth(prereq.level.level)}`);
			}
			if (prereq.item) {
				prerequisiteLine.push(`${prereq.item.join('; ')}`);
			}
			if (prereq.feat) {
				prerequisiteLine.push(`${prereq.feat.join('; ')}`);
			}
			if (prereq.feature) {
				prerequisiteLine.push(`${prereq.feature.join('; ')}`);
			}
		}
		descriptionLines.push(`**Prerequisite** ${prerequisiteLine.join(', ')}`);
	}
	descriptionLines.push(this.entryParser.parseEntries(optionalFeature.entries));
	return {
		title: title,
		description: descriptionLines.join('\n'),
	};
}
