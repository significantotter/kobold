import { Neboa, Collection } from 'neboa';
import { fetchManyJsonFiles } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import { zClassFeatureSchema, ClassFeature } from './ClassFeatures.zod.js';

export class ClassFeatures extends Model<typeof zClassFeatureSchema> {
	public collection: Collection<ClassFeature>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<ClassFeature>('classFeatures');
	}
	public z = zClassFeatureSchema;
	public getFiles(): any[] {
		return fetchManyJsonFiles('class');
	}
	public resourceListFromFile(file: any): any[] {
		return file.classFeature;
	}
	public async import() {
		await this._importData();
	}
}
