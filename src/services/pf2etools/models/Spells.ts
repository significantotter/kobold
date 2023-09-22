import { Neboa, Collection } from 'neboa';
import { zSpellSchema, Spell } from '../pf2etools.zod.js';
import { fetchManyJsonFiles } from './helpers.js';
import { Model } from './Model.js';

export class Spells extends Model<typeof zSpellSchema> {
	public collection: Collection<Spell>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<Spell>('spells');
	}
	public z = zSpellSchema;
	public getFiles(): any[] {
		return fetchManyJsonFiles('spells');
	}
	public resourceListFromFile(file: any): any[] {
		return file.spell ?? [];
	}
	public async import() {
		await this._importData();
	}
}
