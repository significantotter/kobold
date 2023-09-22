import { Neboa, Collection } from 'neboa';
import { Ability, zAbilitySchema } from '../pf2etools.zod.js';
import { fetchOneJsonFileAndEscape, importData } from './helpers.js';
import { Model } from './Model.js';

export class Abilities extends Model<typeof zAbilitySchema> {
	public collection: Collection<Ability>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<Ability>('abilities');
	}
	public z = zAbilitySchema;
	public getFiles(): any[] {
		return [fetchOneJsonFileAndEscape('abilities')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.ability;
	}
	public async import() {
		await this._importData();
	}
}
