import { EmbedData } from 'discord.js';
import { Book } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';

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
