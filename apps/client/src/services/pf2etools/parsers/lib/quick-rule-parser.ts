import type { EmbedData } from 'discord.js';
import type { QuickRule } from '../../schemas/index.js';
import type { CompendiumEmbedParser } from '../compendium-parser.js';

export async function _parseQuickRule(this: CompendiumEmbedParser, quickRule: QuickRule) {
	const preprocessedData = (await this.preprocessData(quickRule)) as QuickRule;
	return parseQuickRule.call(this, preprocessedData);
}

export function parseQuickRule(this: CompendiumEmbedParser, quickRule: QuickRule): EmbedData {
	const title = `${quickRule.name}`;

	const description = this.entryParser.parseEntry(quickRule.rule);
	return {
		title: title,
		description: description,
	};
}
