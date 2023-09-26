import { Neboa, Collection } from 'neboa';
import { zCompanionAbilitySchema, CompanionAbility } from './CompanionAbilities.zod.js';
import { fetchOneJsonFileAndEscape } from './lib/helpers.js';
import { Model } from './lib/Model.js';

export class CompanionAbilities extends Model<typeof zCompanionAbilitySchema> {
	public collection: Collection<CompanionAbility>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<CompanionAbility>('companionAbilities');
	}
	public z = zCompanionAbilitySchema;
	public getFiles(): any[] {
		return [fetchOneJsonFileAndEscape('companionsfamiliars')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.companionAbility;
	}
	public async import() {
		await this._importData();
	}
}
