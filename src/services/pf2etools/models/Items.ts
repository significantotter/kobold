import { Neboa, Collection } from 'neboa';
import { zItemSchema, Item, ItemFluff, zItemFluffSchema } from './Items.zod.js';
import { fetchManyJsonFiles, fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';

export class Items extends Model<typeof zItemSchema> {
	public collection: Collection<Item>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<Item>('items');
	}
	public z = zItemSchema;
	public getFiles(): any[] {
		return fetchManyJsonFiles('items').concat(fetchOneJsonFile('items/baseitems'));
	}
	public resourceListFromFile(file: any): any[] {
		return file.item ?? file.baseitem ?? [];
	}
	public async import() {
		await this._importData();
	}
}

export class ItemsFluff extends Model<typeof zItemFluffSchema> {
	public collection: Collection<ItemFluff>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<ItemFluff>('itemsFluff');
	}
	public z = zItemFluffSchema;
	public getFiles(): any[] {
		return fetchManyJsonFiles('items', 'fluff-index.json');
	}
	public resourceListFromFile(file: any): any[] {
		return file.itemFluff ?? [];
	}
	public async import() {
		await this._importData();
	}
}
