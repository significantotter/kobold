import type { EmbedData } from 'discord.js';
import type { VariantRule } from '../../schemas/index.js';
import type { CompendiumEmbedParser } from '../compendium-parser.js';

export async function _parseVariantRule(this: CompendiumEmbedParser, variantRule: VariantRule) {
	const preprocessedData = (await this.preprocessData(variantRule)) as VariantRule;
	return parseVariantRule.call(this, preprocessedData);
}

export function parseVariantRule(this: CompendiumEmbedParser, variantRule: VariantRule): EmbedData {
	const title = `${variantRule.name}`;

	const descriptionLines: string[] = [];
	if (variantRule.rarity) descriptionLines.push(`**Rarity** ${variantRule.rarity}`);
	if (variantRule.category) descriptionLines.push(`**Category** ${variantRule.category}`);
	if (variantRule.subCategory)
		descriptionLines.push(`**Subcategory** ${variantRule.subCategory}`);

	descriptionLines.push(this.entryParser.parseEntries(variantRule.entries));
	return {
		title: title,
		description: descriptionLines.join('\n'),
	};
}
