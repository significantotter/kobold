import { Neboa, Collection } from 'neboa';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import { zDeitySchema, Deity, zDeityFluffSchema, DeityFluff } from './Deities.zod.js';

export class Deities extends Model<typeof zDeitySchema> {
	public collection: Collection<Deity>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<Deity>('deities');
	}
	public z = zDeitySchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('deities')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.deity ?? [];
	}
	public async import() {
		await this._importData();
	}
}

export class DeitiesFluff extends Model<typeof zDeityFluffSchema> {
	public collection: Collection<DeityFluff>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<DeityFluff>('deitiesFluff');
	}
	public z = zDeityFluffSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('fluff-deities')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.deityFluff ?? [];
	}
	public async import() {
		await this._importData();
	}
}
