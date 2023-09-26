import { Neboa, Collection } from 'neboa';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import {
	Organization,
	OrganizationFluff,
	zOrganizationFluffSchema,
	zOrganizationSchema,
} from './Organizations.zod.js';

export class Organizations extends Model<typeof zOrganizationSchema> {
	public collection: Collection<Organization>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<Organization>('organizations');
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

export class OrganizationsFluff extends Model<typeof zOrganizationFluffSchema> {
	public collection: Collection<OrganizationFluff>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<OrganizationFluff>('organizationFluff');
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
