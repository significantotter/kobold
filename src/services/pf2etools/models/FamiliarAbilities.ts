import { Neboa, Collection } from 'neboa';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import { zFamiliarAbilitySchema, FamiliarAbility } from './FamiliarAbilities.zod.js';

export class FamiliarAbilities extends Model<typeof zFamiliarAbilitySchema> {
	public collection: Collection<FamiliarAbility>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<FamiliarAbility>('familiarAbilities');
	}
	public z = zFamiliarAbilitySchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('companionsfamiliars')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.familiarAbility;
	}
	public async import() {
		await this._importData();
	}
}
