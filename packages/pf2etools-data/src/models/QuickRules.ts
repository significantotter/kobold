import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import { zQuickRuleSchema, QuickRule } from './../schemas/index.js';
import { z } from 'zod';

export class QuickRules extends Model<typeof zQuickRuleSchema, typeof schema.QuickRules> {
	public table = schema.QuickRules;
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zQuickRuleSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('quickRules')];
	}
	public resourceListFromFile(file: any): any[] {
		return Object.entries(file.quickRules).map(([name, rule]: [string, any]) => ({
			name,
			rule,
		}));
	}
	public generateSearchText(quickRule: QuickRule): string {
		return `Rule: ${quickRule.name}`;
	}
	public generateTags(quickRule: QuickRule): string[] {
		return [];
	}
	public async import() {
		await this._importData();
	}
}
