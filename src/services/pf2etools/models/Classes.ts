import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchManyJsonFiles } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import { zClassSchema, Class } from './Classes.zod.js';

export class Classes extends Model<typeof zClassSchema, typeof schema.Classes> {
	public table = schema.Classes;
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zClassSchema;
	public getFiles(): any[] {
		return fetchManyJsonFiles('class');
	}
	public resourceListFromFile(file: any): any[] {
		return file.class;
	}
	public generateSearchText(resource: Class): string {
		return `Class: ${resource.name}`;
	}
	public generateTags(resource: Class): string[] {
		return [resource.rarity ?? 'common'];
	}
	public async import() {
		await this._importData();
	}
}
