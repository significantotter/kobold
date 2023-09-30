import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import { zVariantRuleSchema, VariantRule } from './VariantRules.zod.js';

export class VariantRules extends Model<typeof zVariantRuleSchema, typeof schema.VariantRules> {
	public table = schema.VariantRules;
	public generateSearchText(resource: VariantRule): string {
		return `VariantRule: ${resource.name}`;
	}
	public generateTags(resource: VariantRule): string[] {
		return [];
	}
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zVariantRuleSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('variantRules')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.variantrule;
	}
	public async import() {
		await this._importData();
	}
}
