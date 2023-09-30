import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import { zEidolonSchema, Eidolon } from './Eidolons.zod.js';

export class Eidolons extends Model<typeof zEidolonSchema, typeof schema.Eidolons> {
	public table = schema.Eidolons;
	public generateSearchText(resource: Eidolon): string {
		return `Eidolon: ${resource.name}`;
	}
	public generateTags(resource: Eidolon): string[] {
		return [];
	}
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zEidolonSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('companionsfamiliars')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.eidolon;
	}
	public async import() {
		await this._importData();
	}
}
