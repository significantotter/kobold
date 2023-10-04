import { EmbedData } from 'discord.js';
import { Book } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';

export async function parseBook(this: CompendiumEmbedParser, book: Book): Promise<EmbedData> {
	const title = `${book.name}`;

	return {
		title: title,
	};
}
