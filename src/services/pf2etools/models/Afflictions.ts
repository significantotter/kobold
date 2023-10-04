import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { zAfflictionSchema, Affliction } from './../schemas/index.js';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';

export class Afflictions extends Model<typeof zAfflictionSchema, typeof schema.Afflictions> {
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zAfflictionSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('afflictions')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.disease.concat(file.curse);
	}
	public table = schema.Afflictions;
	public generateSearchText(affliction: Affliction): string {
		return `${affliction.type}: ${affliction.name}`;
	}
	public generateTags(affliction: Affliction): string[] {
		return affliction.traits ?? [];
	}
	public async import() {
		await this._importData();
	}
}
