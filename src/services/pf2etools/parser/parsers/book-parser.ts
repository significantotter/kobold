import { KoboldEmbed } from '../../../../utils/kobold-embed-utils.js';
import { Book } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseBook(this: CompendiumEmbedParser, book: Book): Promise<KoboldEmbed> {
	const title = `${book.name}`;

	return new KoboldEmbed({
		title: title,
	});
}
