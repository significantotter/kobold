import type { EmbedData } from 'discord.js';
import type { CompendiumEmbedParser } from '../compendium-parser.js';

import { Condition } from '../../schemas/index.js';

export async function _parseCondition(this: CompendiumEmbedParser, condition: Condition) {
	const preprocessedData = (await this.preprocessData(condition)) as Condition;
	return parseCondition.call(this, preprocessedData);
}

export function parseCondition(this: CompendiumEmbedParser, condition: Condition): EmbedData {
	const title = `${condition.name}`;
	const description = this.entryParser.parseEntries(condition.entries);
	return {
		title: title,
		description: description,
	};
}
