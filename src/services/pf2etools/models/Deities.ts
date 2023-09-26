import { Neboa, Collection } from 'neboa';
import { fetchOneJsonFileAndEscape } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import { zDeitySchema, Deity } from './Deities.zod.js';

export class Deities extends Model<typeof zDeitySchema> {
	public collection: Collection<Deity>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<Deity>('deities');
	}
	public z = zDeitySchema;
	public getFiles(): any[] {
		return [fetchOneJsonFileAndEscape('deities')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.deity ?? [];
	}
	public async import() {
		await this._importData();
	}
}
