import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import {
	Organization,
	OrganizationFluff,
	zOrganizationFluffSchema,
	zOrganizationSchema,
} from './Organizations.zod.js';

export class Organizations extends Model<typeof zOrganizationSchema, typeof schema.Organizations> {
	public table = schema.Organizations;
	public generateSearchText(resource: Organization): string {
		return `Organization: ${resource.name}`;
	}
	public generateTags(resource: Organization): string[] {
		return [];
	}
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zOrganizationSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('organizations')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.organization;
	}
	public async import() {
		await this._importData();
	}
}

export class OrganizationsFluff extends Model<
	typeof zOrganizationFluffSchema,
	typeof schema.OrganizationsFluff
> {
	public table = schema.OrganizationsFluff;
	public generateSearchText(resource: OrganizationFluff): string {
		return `OrganizationFluff: ${resource.name}`;
	}
	public generateTags(resource: OrganizationFluff): string[] {
		return [];
	}
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zOrganizationFluffSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('fluff-organizations')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.organizationFluff;
	}
	public async import() {
		await this._importData();
	}
}
