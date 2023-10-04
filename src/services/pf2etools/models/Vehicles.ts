import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import { zVehicleSchema, Vehicle } from '../schemas/Vehicles.zod.js';

export class Vehicles extends Model<typeof zVehicleSchema, typeof schema.Vehicles> {
	public table = schema.Vehicles;
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zVehicleSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('vehicles')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.vehicle;
	}
	public generateSearchText(vehicle: Vehicle): string {
		return `Vehicle: ${vehicle.name}`;
	}
	public generateTags(vehicle: Vehicle): string[] {
		return [vehicle.source].concat(vehicle.traits ?? []);
	}
	public async import() {
		await this._importData();
	}
}
