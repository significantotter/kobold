import { Neboa, Collection } from 'neboa';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import { zDomainSchema, Domain } from './Domains.zod.js';

export class Domains extends Model<typeof zDomainSchema> {
	public collection: Collection<Domain>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<Domain>('domains');
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
