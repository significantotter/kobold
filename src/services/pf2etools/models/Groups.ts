import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import { zGroupSchema, Group } from './Groups.zod.js';

export class Groups extends Model<typeof zGroupSchema, typeof schema.Groups> {
	public table = schema.Groups;
	public generateSearchText(resource: Group): string {
		return `Group: ${resource.name}`;
	}
	public generateTags(resource: Group): string[] {
		return [];
	}
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zGroupSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('groups')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.group;
	}
	public async import() {
		await this._importData();
	}
}
