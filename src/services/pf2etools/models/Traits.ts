import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import { zTraitSchema, Trait } from './Traits.zod.js';

export class Traits extends Model<typeof zTraitSchema, typeof schema.Traits> {
	public table = schema.Traits;
	public generateSearchText(resource: Trait): string {
		return `Trait: ${resource.name}`;
	}
	public generateTags(resource: Trait): string[] {
		return [];
	}
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
	public async import() {
		await this._importData();
	}
}
