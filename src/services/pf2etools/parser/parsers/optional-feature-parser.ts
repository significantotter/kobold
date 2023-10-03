import { KoboldEmbed } from '../../../../utils/kobold-embed-utils.js';
import { OptionalFeature } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';
import { nth } from '../compendium-parser-helpers.js';

export async function parseOptionalFeature(
	this: CompendiumEmbedParser,
	optionalFeature: OptionalFeature
): Promise<KoboldEmbed> {
	const title = `${optionalFeature.name}`;
	const entryParser = new EntryParser(this.helpers, { delimiter: '\n' });
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
	descriptionLines.push(entryParser.parseEntries(optionalFeature.entries));
	return new KoboldEmbed({
		title: title,
		description: descriptionLines.join('\n'),
	});
}
