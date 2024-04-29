import type { EmbedData } from 'discord.js';
import type { Table } from '../../schemas/index.js';
import type { CompendiumEmbedParser } from '../compendium-parser.js';

import _ from 'lodash';

export async function _parseTable(this: CompendiumEmbedParser, tableValue: Table) {
	const preprocessedData = (await this.preprocessData(tableValue)) as Table;
	return parseTable.call(this, preprocessedData);
}

export function parseTable(this: CompendiumEmbedParser, tableValue: Table): EmbedData {
	const title = `${tableValue.name}`;

	return {
		title: title,
		description: this.entryParser.parseTableEntry({ ...tableValue, type: 'table' }),
	};
}
