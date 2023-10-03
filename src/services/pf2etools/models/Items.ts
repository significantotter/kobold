import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { zItemSchema, Item, ItemFluff, zItemFluffSchema } from './Items.zod.js';
import { fetchManyJsonFiles, fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';

export class Items extends Model<typeof zItemSchema, typeof schema.Items> {
	public table = schema.Items;
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zItemSchema;
	public getFiles(): any[] {
		return fetchManyJsonFiles('items').concat(fetchOneJsonFile('items/baseitems'));
	}
	public resourceListFromFile(file: any): any[] {
		return file.item ?? file.baseitem ?? [];
	}
	public generateSearchText(item: Item): string {
		return `Item: ${item.name}`;
	}
	public generateTags(item: Item): string[] {
		return [item.source].concat(item.traits ?? []).concat(item.type ? [item.type] : []);
	}
	public async import() {
		await this._importData();
	}
}

export class ItemsFluff extends Model<typeof zItemFluffSchema, typeof schema.ItemsFluff> {
	public table = schema.ItemsFluff;
	public generateSearchText(resource: ItemFluff): string {
		return `ItemFluff: ${resource.name}`;
	}
	public generateTags(resource: ItemFluff): string[] {
		return [];
	}
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
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
