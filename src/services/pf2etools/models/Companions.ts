import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { zCompanionSchema, Companion } from './Companions.zod.js';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';

export class Companions extends Model<typeof zCompanionSchema, typeof schema.Companions> {
	public table = schema.Companions;
	public generateSearchText(resource: Companion): string {
		return `Companion: ${resource.name}`;
	}
	public generateTags(resource: Companion): string[] {
		return [];
	}
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zCompanionSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('companionsfamiliars')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.companion;
	}
	public async import() {
		await this._importData();
	}
}
