import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import { zTraitSchema, Trait } from './Traits.zod.js';

export class Traits extends Model<typeof zTraitSchema, typeof schema.Traits> {
	public table = schema.Traits;
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zTraitSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('traits')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.trait;
	}
	public generateSearchText(trait: Trait): string {
		return `Trait: ${trait.name}`;
	}
	public generateTags(trait: Trait): string[] {
		return [trait.source];
	}
	public async import() {
		await this._importData();
	}
}
