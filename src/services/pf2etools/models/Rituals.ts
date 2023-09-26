import { Neboa, Collection } from 'neboa';
import { fetchOneJsonFileAndEscape } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import { zRitualSchema, Ritual } from '../helpers.zod.js';

export class Rituals extends Model<typeof zRitualSchema> {
	public collection: Collection<Ritual>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<Ritual>('rituals');
	}
	public z = zRitualSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFileAndEscape('rituals')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.ritual;
	}
	public async import() {
		await this._importData();
	}
}
