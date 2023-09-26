import { Neboa, Collection } from 'neboa';
import { zActionSchema, Action } from './Actions.zod.js';
import { fetchOneJsonFileAndEscape } from './lib/helpers.js';
import { Model } from './lib/Model.js';

export class Actions extends Model<typeof zActionSchema> {
	public collection: Collection<Action>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<Action>('actions');
	}
	public z = zActionSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFileAndEscape('actions')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.action;
	}
	public async import() {
		await this._importData();
	}
}
