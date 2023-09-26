import { Neboa, Collection } from 'neboa';
import { zBackgroundSchema, Background } from './Backgrounds.zod.js';
import { fetchManyJsonFiles, fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';

export class Backgrounds extends Model<typeof zBackgroundSchema> {
	public collection: Collection<Background>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<Background>('backgrounds');
	}
	public z = zBackgroundSchema;
	public getFiles(): any[] {
		return fetchManyJsonFiles('backgrounds');
	}
	public resourceListFromFile(file: any): any[] {
		return file.background ?? [];
	}
	public async import() {
		await this._importData();
	}
}
