import { Neboa, Collection } from 'neboa';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import { Familiar, zFamiliarSchema } from './Familiars.zod.js';

export class Familiars extends Model<typeof zFamiliarSchema> {
	public collection: Collection<Familiar>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<Familiar>('familiars');
	}
	public z = zFamiliarSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('companionsfamiliars')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.familiar;
	}
	public async import() {
		await this._importData();
	}
}
