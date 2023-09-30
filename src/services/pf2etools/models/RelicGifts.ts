import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import { zRelicGiftSchema, RelicGift } from './RelicGifts.zod.js';

export class RelicGifts extends Model<typeof zRelicGiftSchema, typeof schema.RelicGifts> {
	public table = schema.RelicGifts;
	public generateSearchText(resource: RelicGift): string {
		return `RelicGift: ${resource.name}`;
	}
	public generateTags(resource: RelicGift): string[] {
		return [];
	}
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zRelicGiftSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('relicGifts')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.relicGift;
	}
	public async import() {
		await this._importData();
	}
}
