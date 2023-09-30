import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import { zConditionSchema, Condition } from './Conditions.zod.js';

export class Conditions extends Model<typeof zConditionSchema, typeof schema.Conditions> {
	public table = schema.Conditions;
	public generateSearchText(resource: Condition): string {
		return `Condition: ${resource.name}`;
	}
	public generateTags(resource: Condition): string[] {
		return [];
	}
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zConditionSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('conditions')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.condition ?? [];
	}
	public async import() {
		await this._importData();
	}
}
