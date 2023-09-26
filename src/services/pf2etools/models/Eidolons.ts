import { Neboa, Collection } from 'neboa';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import { zEidolonSchema, Eidolon } from './Eidolons.zod.js';

export class Eidolons extends Model<typeof zEidolonSchema> {
	public collection: Collection<Eidolon>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<Eidolon>('eidolons');
	}
	public z = zEidolonSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('companionsfamiliars')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.eidolon;
	}
	public async import() {
		await this._importData();
	}
}
