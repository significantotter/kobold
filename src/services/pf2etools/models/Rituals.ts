import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import { zRitualSchema, Ritual } from './Rituals.zod.js';

export class Rituals extends Model<typeof zRitualSchema, typeof schema.Rituals> {
	public table = schema.Rituals;
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zRitualSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('rituals')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.ritual;
	}
	public generateSearchText(ritual: Ritual): string {
		return `Ritual ${ritual.level}: ${ritual.name}`;
	}
	public generateTags(ritual: Ritual): string[] {
		return [ritual.source].concat(ritual.traits ?? []);
	}
	public async import() {
		await this._importData();
	}
}
