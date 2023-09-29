import { Neboa, Collection } from 'neboa';
import { fetchManyJsonFiles, fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import { zClassSchema, Class } from './Classes.zod.js';

export class Classes extends Model<typeof zClassSchema> {
	public collection: Collection<Class>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<Class>('classes');
	}
	public z = zClassSchema;
	public getFiles(): any[] {
		return fetchManyJsonFiles('class');
	}
	public resourceListFromFile(file: any): any[] {
		return file.class;
	}
	public async import() {
		await this._importData();
	}
}
