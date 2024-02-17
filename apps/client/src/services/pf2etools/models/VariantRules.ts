import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import { zVariantRuleSchema, VariantRule } from './../schemas/index.js';

export class VariantRules extends Model<typeof zVariantRuleSchema, typeof schema.VariantRules> {
	public table = schema.VariantRules;
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
	public generateSearchText(variantRule: VariantRule): string {
		return `VariantRule: ${variantRule.name}`;
	}
	public generateTags(variantRule: VariantRule): string[] {
		return [variantRule.source];
	}
	public async import() {
		await this._importData();
	}
}
