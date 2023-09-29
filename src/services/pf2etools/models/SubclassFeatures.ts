import { Neboa, Collection } from 'neboa';
import { fetchManyJsonFiles, fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import { zSubclassFeatureSchema, SubclassFeature } from './SubclassFeatures.zod.js';

export class SubclassFeatures extends Model<typeof zSubclassFeatureSchema> {
	public collection: Collection<SubclassFeature>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<SubclassFeature>('subclassFeatures');
	}
	public z = zSubclassFeatureSchema;
	public getFiles(): any[] {
		return fetchManyJsonFiles('class');
	}
	public resourceListFromFile(file: any): any[] {
		return file.subclassFeature;
	}
	public async import() {
		await this._importData();
	}
}
