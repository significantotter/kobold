import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import { Language, zLanguageSchema } from './Languages.zod.js';

export class Languages extends Model<typeof zLanguageSchema, typeof schema.Languages> {
	public table = schema.Languages;
	public generateSearchText(resource: Language): string {
		return `Language: ${resource.name}`;
	}
	public generateTags(resource: Language): string[] {
		return [];
	}
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zLanguageSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('languages')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.language;
	}
	public async import() {
		await this._importData();
	}
}
