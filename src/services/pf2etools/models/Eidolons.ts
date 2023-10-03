import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import { zEidolonSchema, Eidolon } from './Eidolons.zod.js';

export class Eidolons extends Model<typeof zEidolonSchema, typeof schema.Eidolons> {
	public table = schema.Eidolons;
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
	public generateSearchText(eidolon: Eidolon): string {
		return `Eidolon: ${eidolon.name}`;
	}
	public generateTags(eidolon: Eidolon): string[] {
		return [eidolon.source].concat(eidolon.traits ?? []);
	}
	public async import() {
		await this._importData();
	}
}
