import { Neboa, Collection } from 'neboa';
import { zItemSchema, Item } from '../pf2etools.zod.js';
import { fetchManyJsonFiles } from './helpers.js';
import { Model } from './Model.js';

export class Items extends Model<typeof zItemSchema> {
	public collection: Collection<Item>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<Item>('items');
	}
	public z = zItemSchema;
	public getFiles(): any[] {
		return fetchManyJsonFiles('items');
	}
	public resourceListFromFile(file: any): any[] {
		return file.item ?? [];
	}
	public async import() {
		await this._importData();
	}
}
