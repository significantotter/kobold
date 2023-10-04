import { EmbedData } from 'discord.js';
import { Table } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';
import { table } from 'table';
import _ from 'lodash';

export async function parseTable(
	this: CompendiumEmbedParser,
	tableValue: Table
): Promise<EmbedData> {
	const title = `${tableValue.name}`;
	const entryParser = new EntryParser({ delimiter: '\n\n', emojiConverter: this.emojiConverter });
	return {
		title: title,
		description: entryParser.parseTableEntry({ ...tableValue, type: 'table' }),
	};
}
