import { Neboa, Collection } from 'neboa';
import { zCompanionSchema, Companion } from './Companions.zod.js';
import { fetchOneJsonFileAndEscape } from './lib/helpers.js';
import { Model } from './lib/Model.js';

export class Companions extends Model<typeof zCompanionSchema> {
	public collection: Collection<Companion>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<Companion>('companions');
	}
	public z = zCompanionSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFileAndEscape('companionsfamiliars')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.companion;
	}
	public async import() {
		await this._importData();
	}
}
