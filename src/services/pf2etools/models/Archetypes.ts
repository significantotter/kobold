import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { zArchetypeSchema, Archetype } from './Archetypes.zod.js';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';

export class Archetypes extends Model<typeof zArchetypeSchema, typeof schema.Archetypes> {
	public table = schema.Archetypes;
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zArchetypeSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('archetypes')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.archetype ?? [];
	}
	public generateSearchText(archetype: Archetype): string {
		return `Archetype: ${archetype.name}`;
	}
	public generateTags(archetype: Archetype): string[] {
		return [archetype.rarity ?? 'common'].concat(archetype.miscTags ?? []);
	}
	public async import() {
		await this._importData();
	}
}
