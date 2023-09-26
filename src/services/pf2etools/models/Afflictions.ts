import { Neboa, Collection } from 'neboa';
import { zAfflictionSchema, Affliction } from './Afflictions.zod.js';
import { fetchOneJsonFileAndEscape } from './lib/helpers.js';
import { Model } from './lib/Model.js';

export class Afflictions extends Model<typeof zAfflictionSchema> {
	public collection: Collection<Affliction>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<Affliction>('afflictions');
	}
	public z = zAfflictionSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFileAndEscape('afflictions')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.disease.concat(file.curse);
	}
	public async import() {
		await this._importData();
	}
}
