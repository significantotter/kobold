import { Neboa, Collection } from 'neboa';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import { zSourceSchema, Source } from './Sources.zod.js';

export class Sources extends Model<typeof zSourceSchema> {
	public collection: Collection<Source>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<Source>('sources');
	}
	public z = zSourceSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('sources')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.source;
	}
	public async import() {
		await this._importData();
	}
}
