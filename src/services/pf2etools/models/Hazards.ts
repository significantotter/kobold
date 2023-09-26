import { Neboa, Collection } from 'neboa';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import { Hazard, zHazardSchema } from './Hazards.zod.js';

export class Hazards extends Model<typeof zHazardSchema> {
	public collection: Collection<Hazard>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<Hazard>('hazards');
	}
	public z = zHazardSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('hazards')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.hazard;
	}
	public async import() {
		await this._importData();
	}
}
