import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { zBookSchema, Book } from './Books.zod.js';
import { fetchAllJsonFilesInDirectory, fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';

export class Books extends Model<typeof zBookSchema, typeof schema.Books> {
	public table = schema.Books;
	public generateSearchText(resource: Book): string {
		return `Book: ${resource.name}`;
	}
	public generateTags(resource: Book): string[] {
		return [];
	}
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zBookSchema;
	public getFiles(): any[] {
		return fetchOneJsonFile('books');
	}
	public resourceListFromFile(file: any): any[] {
		return [{ ...file }];
	}
	public async import() {
		await this._importData();
	}
}
