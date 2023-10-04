import { EmbedData } from 'discord.js';
import { VariantRule } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseVariantRule(
	this: CompendiumEmbedParser,
	variantRule: VariantRule
): Promise<EmbedData> {
	const title = `${variantRule.name}`;
	const entryParser = new EntryParser({ delimiter: '\n', emojiConverter: this.emojiConverter });
	const descriptionLines: string[] = [];
	if (variantRule.rarity) descriptionLines.push(`**Rarity** ${variantRule.rarity}`);
	if (variantRule.category) descriptionLines.push(`**Category** ${variantRule.category}`);
	if (variantRule.subCategory)
		descriptionLines.push(`**Subcategory** ${variantRule.subCategory}`);

	descriptionLines.push(entryParser.parseEntries(variantRule.entries));
	return {
		title: title,
		description: descriptionLines.join('\n'),
	};
}
