import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { zCreatureSchema, Creature, zCreatureFluffSchema, CreatureFluff } from './Bestiary.zod.js';
import { fetchManyJsonFiles } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';

export class Creatures extends Model<typeof zCreatureSchema, typeof schema.Creatures> {
	public table = schema.Creatures;
	public generateSearchText(resource: Creature): string {
		return `Creature: ${resource.name}${resource.level ? ` (Lvl ${resource.level})` : ''}`;
	}
	public generateTags(resource: Creature): string[] {
		return [];
	}
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zCreatureSchema;
	public getFiles(): any[] {
		return fetchManyJsonFiles('bestiary');
	}
	public resourceListFromFile(file: any): any[] {
		return file.creature ?? [];
	}
	public async import() {
		await this._importData();
	}
}

export class CreaturesFluff extends Model<
	typeof zCreatureFluffSchema,
	typeof schema.CreaturesFluff
> {
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zCreatureFluffSchema;
	public getFiles(): any[] {
		return fetchManyJsonFiles('bestiary', 'fluff-index.json');
	}
	public resourceListFromFile(file: any): any[] {
		return file.creatureFluff ?? [];
	}
	public table = schema.CreaturesFluff;
	public generateSearchText(resource: CreatureFluff): string {
		return `CreatureFluff: ${resource.name}`;
	}
	public generateTags(resource: CreatureFluff): string[] {
		return [];
	}
	public async import() {
		await this._importData();
	}
}
