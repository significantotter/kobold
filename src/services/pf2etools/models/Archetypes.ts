import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { zArchetypeSchema, Archetype } from './Archetypes.zod.js';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';

export class Archetypes extends Model<typeof zArchetypeSchema, typeof schema.Archetypes> {
	public table = schema.Archetypes;
	public generateSearchText(resource: Archetype): string {
		return `Archetype: ${resource.name}`;
	}
	public generateTags(resource: Archetype): string[] {
		return [];
	}
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
	public async import() {
		await this._importData();
	}
}
