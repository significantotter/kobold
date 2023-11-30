import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import { zConditionSchema, Condition } from './../schemas/index.js';

export class Conditions extends Model<typeof zConditionSchema, typeof schema.Conditions> {
	public table = schema.Conditions;
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
	public generateSearchText(condition: Condition): string {
		return `Condition: ${condition.name}`;
	}
	public generateTags(condition: Condition): string[] {
		return [];
	}
	public async import() {
		await this._importData();
	}
}
