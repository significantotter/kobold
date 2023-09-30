import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchManyJsonFiles } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import { zAncestrySchema, Ancestry } from './Ancestries.zod.js';

export class Ancestries extends Model<typeof zAncestrySchema, typeof schema.Ancestries> {
	public table = schema.Ancestries;
	public generateSearchText(resource: Ancestry): string {
		return `Ancestry: ${resource.name}`;
	}
	public generateTags(resource: Ancestry): string[] {
		return [];
	}
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zAncestrySchema;
	public getFiles(): any[] {
		return fetchManyJsonFiles('ancestries');
	}
	public resourceListFromFile(file: any): any[] {
		return file.ancestry;
	}
	public async import() {
		await this._importData();
	}
}
