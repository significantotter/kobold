import { Neboa, Collection } from 'neboa';
import { fetchOneJsonFileAndEscape } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import { zTraitSchema, Trait } from './Traits.zod.js';

export class Traits extends Model<typeof zTraitSchema> {
	public collection: Collection<Trait>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<Trait>('traits');
	}
	public z = zTraitSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFileAndEscape('traits')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.trait;
	}
	public async import() {
		await this._importData();
	}
}
