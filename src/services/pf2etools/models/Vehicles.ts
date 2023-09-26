import { Neboa, Collection } from 'neboa';
import { fetchOneJsonFileAndEscape } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import { zVehicleSchema, Vehicle } from './Vehicles.zod.js';

export class Vehicles extends Model<typeof zVehicleSchema> {
	public collection: Collection<Vehicle>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<Vehicle>('vehicles');
	}
	public z = zVehicleSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFileAndEscape('vehicles')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.vehicle;
	}
	public async import() {
		await this._importData();
	}
}
