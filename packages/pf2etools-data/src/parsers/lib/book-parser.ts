import type { EmbedData } from 'discord.js';
import type { Book } from '../../schemas/index.js';
import type { CompendiumEmbedParser } from '../compendium-parser.js';

export async function _parseBook(this: CompendiumEmbedParser, book: Book) {
	const preprocessedData = (await this.preprocessData(book)) as Book;
	return parseBook.call(this, preprocessedData);
}

export function parseBook(this: CompendiumEmbedParser, book: Book): EmbedData {
	const title = `${book.name}`;

	return {
		title: title,
	};
}
