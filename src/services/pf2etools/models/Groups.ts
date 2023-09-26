import { Neboa, Collection } from 'neboa';
import { fetchOneJsonFileAndEscape } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import { zGroupSchema, Group } from './Groups.zod.js';

export class Groups extends Model<typeof zGroupSchema> {
	public collection: Collection<Group>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<Group>('groups');
	}
	public z = zGroupSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFileAndEscape('groups')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.group;
	}
	public async import() {
		await this._importData();
	}
}
