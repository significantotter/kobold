import { Neboa, Collection } from 'neboa';
import { fetchOneJsonFileAndEscape } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import { zConditionSchema, Condition } from './Conditions.zod.js';

export class Conditions extends Model<typeof zConditionSchema> {
	public collection: Collection<Condition>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<Condition>('conditions');
	}
	public z = zConditionSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFileAndEscape('conditions')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.condition ?? [];
	}
	public async import() {
		await this._importData();
	}
}
