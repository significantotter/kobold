import { EmbedData } from 'discord.js';
import { Ancestry, AncestryFeature } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function _parseAncestry(this: CompendiumEmbedParser, ancestry: Ancestry) {
	const preprocessedData = (await this.preprocessData(ancestry)) as Ancestry;
	return parseAncestry.call(this, preprocessedData);
}

export function parseAncestry(this: CompendiumEmbedParser, ancestry: Ancestry): EmbedData {
	const entryParser = new EntryParser({ delimiter: '\n', emojiConverter: this.emojiConverter });
	const title = `${ancestry.name}`;
	const descriptionLines: string[] = [];
	if (ancestry.summary.text) descriptionLines.push(ancestry.summary.text);
	if (ancestry.rarity) descriptionLines.push(`**Rarity:** ${ancestry.rarity}`);
	descriptionLines.push(`**Hit Points:** ${ancestry.hp}`);
	descriptionLines.push(`**Size:** ${ancestry.size.join(', ')}`);
	descriptionLines.push(this.helpers.parseSpeed(ancestry.speed));
	descriptionLines.push(`**Ability Boosts:** ${ancestry.boosts.join(', ')}`);
	descriptionLines.push(`**Ability Flaw:** ${(ancestry.flaw ?? []).join(', ') ?? 'None'}`);
	descriptionLines.push(`**Languages:** ${ancestry.languages.join(', ')}`);
	descriptionLines.push(`**Traits:** ${ancestry.traits.join(', ')}`);
	descriptionLines.push(
		(ancestry.features ?? [])
			.map(
				(feature: AncestryFeature) =>
					`**${feature.name}**\n${entryParser.parseEntries(feature.entries)}`
			)
			.join('\n')
	);

	const fields = [];
	if (ancestry.heritage.length > 0) {
		fields.push({
			name: 'Heritages',
			value: `${ancestry.heritageInfo.join('\n')}`,
		});
		const heritageFields = ancestry.heritage.map(heritage => {
			return {
				name: `${heritage.name}`,
				value: `${(heritage.info ?? [])
					.concat(heritage.entries ?? [])
					.map(entry => entryParser.parseEntry(entry))
					.join('\n\n')}`,
			};
		});
		fields.push(heritageFields);
	}

	return {
		title: title,
		description: descriptionLines.join('\n\n'),
		thumbnail: ancestry.summary.images?.[0] ? { url: ancestry.summary.images[0] } : undefined,
		fields: fields.flat(),
	};
}
