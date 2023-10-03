import { KoboldEmbed } from '../../../../utils/kobold-embed-utils.js';
import { Table } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';
import { table } from 'table';
import _ from 'lodash';

export async function parseTable(
	this: CompendiumEmbedParser,
	tableValue: Table
): Promise<KoboldEmbed> {
	const title = `${tableValue.name}`;
	const entryParser = new EntryParser(this.helpers, { delimiter: '\n\n' });
	return new KoboldEmbed({
		title: title,
		description: entryParser.parseTableEntry({ ...tableValue, type: 'table' }),
	});
}
