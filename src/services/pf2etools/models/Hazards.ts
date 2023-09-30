import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import { Hazard, zHazardSchema } from './Hazards.zod.js';

export class Hazards extends Model<typeof zHazardSchema, typeof schema.Hazards> {
	public table = schema.Hazards;
	public generateSearchText(resource: Hazard): string {
		return `Hazard: ${resource.name}`;
	}
	public generateTags(resource: Hazard): string[] {
		return [];
	}
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zHazardSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('hazards')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.hazard;
	}
	public async import() {
		await this._importData();
	}
}
