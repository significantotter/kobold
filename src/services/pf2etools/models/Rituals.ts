import { Neboa, Collection } from 'neboa';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import { zRitualSchema, Ritual } from './Rituals.zod.js';

export class Rituals extends Model<typeof zRitualSchema> {
	public collection: Collection<Ritual>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<Ritual>('rituals');
	}
	public z = zRitualSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('rituals')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.ritual;
	}
	public async import() {
		await this._importData();
	}
}
