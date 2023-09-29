import { Neboa, Collection } from 'neboa';
import { fetchManyJsonFiles } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import { zAncestrySchema, Ancestry } from './Ancestries.zod.js';

export class Ancestries extends Model<typeof zAncestrySchema> {
	public collection: Collection<Ancestry>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<Ancestry>('ancestries');
	}
	public z = zAncestrySchema;
	public getFiles(): any[] {
		return fetchManyJsonFiles('ancestries');
	}
	public resourceListFromFile(file: any): any[] {
		return file.ancestry;
	}
	public async import() {
		await this._importData();
	}
}
