import { Neboa, Collection } from 'neboa';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import { zOptionalFeatureSchema, OptionalFeature } from './OptionalFeatures.zod.js';

export class OptionalFeatures extends Model<typeof zOptionalFeatureSchema> {
	public collection: Collection<OptionalFeature>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<OptionalFeature>('optionalFeatures');
	}
	public z = zOptionalFeatureSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('optionalFeatures')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.optionalfeature ?? [];
	}
	public async import() {
		await this._importData();
	}
}
