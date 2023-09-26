import { Neboa, Collection } from 'neboa';
import { zFeatSchema, Feat } from './Feats.zod.js';
import { fetchManyJsonFiles } from './lib/helpers.js';
import { Model } from './lib/Model.js';

export class Feats extends Model<typeof zFeatSchema> {
	public collection: Collection<Feat>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<Feat>('feats');
	}
	public z = zFeatSchema;
	public getFiles(): any[] {
		return fetchManyJsonFiles('feats');
	}
	public resourceListFromFile(file: any): any[] {
		return file.feat ?? [];
	}
	public async import() {
		await this._importData();
	}
}
