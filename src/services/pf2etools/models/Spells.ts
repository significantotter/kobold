import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { zSpellSchema, Spell } from './Spells.zod.js';
import { fetchManyJsonFiles } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';

export class Spells extends Model<typeof zSpellSchema, typeof schema.Spells> {
	public table = schema.Spells;
	public generateSearchText(resource: Spell): string {
		return `Spell: ${resource.name}`;
	}
	public generateTags(resource: Spell): string[] {
		return [];
	}
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zSpellSchema;
	public getFiles(): any[] {
		return fetchManyJsonFiles('spells');
	}
	public resourceListFromFile(file: any): any[] {
		return file.spell ?? [];
	}
	public async import() {
		await this._importData();
	}
}
