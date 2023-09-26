import { Neboa, Collection } from 'neboa';
import { zBookSchema, Book } from './Books.zod.js';
import { fetchAllJsonFilesInDirectory } from './lib/helpers.js';
import { Model } from './lib/Model.js';

export class Books extends Model<typeof zBookSchema> {
	public collection: Collection<Book>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<Book>('books');
	}
	public z = zBookSchema;
	public getFiles(): any[] {
		return fetchAllJsonFilesInDirectory('book');
	}
	public resourceListFromFile(file: any): any[] {
		return [file];
	}
	public async import() {
		await this._importData();
	}
}
