import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { zFeatSchema, Feat } from './Feats.zod.js';
import { fetchManyJsonFiles } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';

export class Feats extends Model<typeof zFeatSchema, typeof schema.Feats> {
	public table = schema.Feats;
	public generateSearchText(resource: Feat): string {
		return `Feat: ${resource.name}`;
	}
	public generateTags(resource: Feat): string[] {
		return [];
	}
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zFeatSchema;
	public getFiles(): any[] {
		return fetchManyJsonFiles('feats');
	}
	public resourceListFromFile(file: any): any[] {
		return file.feat ?? [];
	}
	public async import() {
		await this._importData();
	}
}
