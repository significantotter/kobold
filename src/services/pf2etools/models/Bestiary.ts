import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import {
	zCreatureSchema,
	Creature,
	zCreatureFluffSchema,
	CreatureFluff,
} from './../schemas/index.js';
import { fetchManyJsonFiles } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';

export class Creatures extends Model<typeof zCreatureSchema, typeof schema.Creatures> {
	public table = schema.Creatures;
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
	public generateSearchText(creature: Creature): string {
		return `Creature${creature.level ? ` ${creature.level}` : ''}: ${creature.name}`;
	}
	public generateTags(creature: Creature): string[] {
		return creature.traits ?? [];
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
