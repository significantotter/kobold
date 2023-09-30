import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import { Familiar, zFamiliarSchema } from './Familiars.zod.js';

export class Familiars extends Model<typeof zFamiliarSchema, typeof schema.Familiars> {
	public table = schema.Familiars;
	public generateSearchText(resource: Familiar): string {
		return `Familiar: ${resource.name}`;
	}
	public generateTags(resource: Familiar): string[] {
		return [];
	}
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zFamiliarSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('companionsfamiliars')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.familiar;
	}
	public async import() {
		await this._importData();
	}
}
