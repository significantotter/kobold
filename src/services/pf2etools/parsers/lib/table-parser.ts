import { EmbedData } from 'discord.js';
import { Table } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';
import { table } from 'table';
import _ from 'lodash';

export async function _parseTable(this: CompendiumEmbedParser, tableValue: Table) {
	const preprocessedData = (await this.preprocessData(tableValue)) as Table;
	return parseTable.call(this, preprocessedData);
}

export function parseTable(this: CompendiumEmbedParser, tableValue: Table): EmbedData {
	const title = `${tableValue.name}`;
	const entryParser = new EntryParser({ delimiter: '\n\n', emojiConverter: this.emojiConverter });
	return {
		title: title,
		description: entryParser.parseTableEntry({ ...tableValue, type: 'table' }),
	};
}
