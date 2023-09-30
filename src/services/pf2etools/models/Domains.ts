import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import { zDomainSchema, Domain } from './Domains.zod.js';

export class Domains extends Model<typeof zDomainSchema, typeof schema.Domains> {
	public table = schema.Domains;
	public generateSearchText(resource: Domain): string {
		return `Domain: ${resource.name}`;
	}
	public generateTags(resource: Domain): string[] {
		return [];
	}
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zDomainSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('domains')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.domain ?? [];
	}
	public async import() {
		await this._importData();
	}
}
