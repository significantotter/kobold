import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import { zRelicGiftSchema, RelicGift } from './../schemas/index.js';

export class RelicGifts extends Model<typeof zRelicGiftSchema, typeof schema.RelicGifts> {
	public table = schema.RelicGifts;
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
	public generateSearchText(relicGift: RelicGift): string {
		return `Relic Gift: ${relicGift.name} (${relicGift.tier})`;
	}
	public generateTags(relicGift: RelicGift): string[] {
		return [relicGift.source].concat(relicGift.traits ?? []);
	}
	public async import() {
		await this._importData();
	}
}
