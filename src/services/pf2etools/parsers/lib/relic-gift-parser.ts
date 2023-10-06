import { EmbedData } from 'discord.js';
import { RelicGift } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';
import _ from 'lodash';

export async function _parseRelicGift(this: CompendiumEmbedParser, relicGift: RelicGift) {
	const preprocessedData = (await this.preprocessData(relicGift)) as RelicGift;
	return parseRelicGift.call(this, preprocessedData);
}

export function parseRelicGift(this: CompendiumEmbedParser, relicGift: RelicGift): EmbedData {
	const title = `${relicGift.name} (${relicGift.tier} Gift)`;
	const entryParser = new EntryParser({ delimiter: '\n', emojiConverter: this.emojiConverter });
	const descriptionLines: string[] = [];
	if (relicGift.traits) descriptionLines.push(`**Traits** ${relicGift.traits.join(', ')}`);
	if (relicGift.aspects)
		descriptionLines.push(
			`**Aspect** ${relicGift.aspects
				.map(aspect => (_.isString(aspect) ? aspect : `${aspect.name} ${aspect.note}`))
				.join(', ')}`
		);
	if (relicGift.prerequisites)
		descriptionLines.push(`**Prerequisites** ${relicGift.prerequisites}`);
	if (relicGift.frequency)
		descriptionLines.push(this.helpers.parseFrequency(relicGift.frequency));
	if (relicGift.entries) descriptionLines.push(entryParser.parseEntries(relicGift.entries));
	return {
		title: title,
		description: descriptionLines.join('\n'),
	};
}
