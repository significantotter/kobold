import { Neboa, Collection } from 'neboa';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import { zPlaceSchema, Place } from './Places.zod.js';

export class Places extends Model<typeof zPlaceSchema> {
	public collection: Collection<Place>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<Place>('places');
	}
	public z = zPlaceSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('places')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.place;
	}
	public async import() {
		await this._importData();
	}
}
