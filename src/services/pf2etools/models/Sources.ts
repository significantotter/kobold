import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import { zSourceSchema, Source } from './Sources.zod.js';

export class Sources extends Model<typeof zSourceSchema, typeof schema.Sources> {
	public table = schema.Sources;
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zSourceSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('sources')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.source;
	}
	public generateSearchText(source: Source): string {
		return `Source: ${source.name}`;
	}
	public generateTags(source: Source): string[] {
		return [source.source];
	}
	public async import() {
		await this._importData();
	}
}
