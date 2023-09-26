import { Neboa, Collection } from 'neboa';
import { fetchOneJsonFileAndEscape } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import { Organization, zOrganizationSchema } from './Organizations.zod.js';

export class Organizations extends Model<typeof zOrganizationSchema> {
	public collection: Collection<Organization>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<Organization>('organizations');
	}
	public z = zOrganizationSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFileAndEscape('organizations')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.organization;
	}
	public async import() {
		await this._importData();
	}
}
