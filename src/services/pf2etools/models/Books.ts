import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { zBookSchema, Book } from './Books.zod.js';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';

export class Books extends Model<typeof zBookSchema, typeof schema.Books> {
	public table = schema.Books;
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zBookSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('books')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.book;
	}
	public generateSearchText(book: Book): string {
		return `Book: ${book.name}`;
	}
	public generateTags(book: Book): string[] {
		return [book.source];
	}
	public async import() {
		await this._importData();
	}
}
