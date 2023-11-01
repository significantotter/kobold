import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchManyJsonFiles, fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import {
	zAncestrySchema,
	Ancestry,
	VersatileHeritage,
	zVersatileHeritageSchema,
} from './../schemas/index.js';

export class Ancestries extends Model<typeof zAncestrySchema, typeof schema.Ancestries> {
	public table = schema.Ancestries;
	public generateSearchText(resource: Ancestry): string {
		return `Ancestry: ${resource.name}`;
	}
	public generateTags(resource: Ancestry): string[] {
		return [];
	}
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zAncestrySchema;
	public getFiles(): any[] {
		return fetchManyJsonFiles('ancestries');
	}
	public resourceListFromFile(file: any): any[] {
		return file.ancestry ?? [];
	}
	public async import() {
		await this._importData();
	}
}

export class VersatileHeritages extends Model<
	typeof zVersatileHeritageSchema,
	typeof schema.VersatileHeritages
> {
	public table = schema.VersatileHeritages;
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zVersatileHeritageSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('ancestries/versatile-heritages')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.versatileHeritage ?? [];
	}
	public generateSearchText(versatileHeritage: VersatileHeritage): string {
		return `Versatile Heritage: ${versatileHeritage.name}`;
	}
	public generateTags(versatileHeritage: VersatileHeritage): string[] {
		return [versatileHeritage.rarity ?? 'common'].concat(versatileHeritage.traits ?? []);
	}
	public async import() {
		await this._importData();
	}
}
