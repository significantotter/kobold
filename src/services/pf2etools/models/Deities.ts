import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import { zDeitySchema, Deity, zDeityFluffSchema, DeityFluff } from './Deities.zod.js';

export class Deities extends Model<typeof zDeitySchema, typeof schema.Deities> {
	public table = schema.Deities;
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zDeitySchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('deities')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.deity ?? [];
	}
	public generateSearchText(deity: Deity): string {
		return `Deity: ${deity.name}`;
	}
	public generateTags(deity: Deity): string[] {
		return [
			...(deity.alignment?.alignment ?? []),
			...(deity.domains?.map(domain => `domain-${domain}`) ?? []),
			deity.source,
		];
	}
	public async import() {
		await this._importData();
	}
}

export class DeitiesFluff extends Model<typeof zDeityFluffSchema, typeof schema.DeitiesFluff> {
	public table = schema.DeitiesFluff;
	public generateSearchText(resource: DeityFluff): string {
		return `DeityFluff: ${resource.name}`;
	}
	public generateTags(resource: DeityFluff): string[] {
		return [];
	}
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zDeityFluffSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('fluff-deities')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.deityFluff ?? [];
	}
	public async import() {
		await this._importData();
	}
}
