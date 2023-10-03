import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { zBackgroundSchema, Background } from './Backgrounds.zod.js';
import { fetchManyJsonFiles, fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';

export class Backgrounds extends Model<typeof zBackgroundSchema, typeof schema.Backgrounds> {
	public table = schema.Backgrounds;
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zBackgroundSchema;
	public getFiles(): any[] {
		return fetchManyJsonFiles('backgrounds');
	}
	public resourceListFromFile(file: any): any[] {
		return file.background ?? [];
	}
	public generateSearchText(background: Background): string {
		return `Background: ${background.name}`;
	}
	public generateTags(background: Background): string[] {
		return ([] as string[]).concat(background.traits ?? []).concat(background.miscTags ?? []);
	}
	public async import() {
		await this._importData();
	}
}
