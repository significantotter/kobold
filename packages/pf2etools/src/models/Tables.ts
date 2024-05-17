import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import { zTableSchema, Table } from './../schemas/index.js';

export class Tables extends Model<typeof zTableSchema, typeof schema.Tables> {
	public table = schema.Tables;
	public generateSearchText(resource: Table): string {
		return `Table: ${resource.name}`;
	}
	public generateTags(resource: Table): string[] {
		return [];
	}
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zTableSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('tables')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.table;
	}
	public async import() {
		await this._importData();
	}
}
