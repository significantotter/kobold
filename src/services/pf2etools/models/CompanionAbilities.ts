import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { zCompanionAbilitySchema, CompanionAbility } from './../schemas/index.js';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';

export class CompanionAbilities extends Model<
	typeof zCompanionAbilitySchema,
	typeof schema.CompanionAbilities
> {
	public table = schema.CompanionAbilities;
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zCompanionAbilitySchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('companionsfamiliars')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.companionAbility;
	}
	public generateSearchText(companionAbility: CompanionAbility): string {
		return `Companion Ability: ${companionAbility.name}`;
	}
	public generateTags(companionAbility: CompanionAbility): string[] {
		return companionAbility.traits ?? [];
	}
	public async import() {
		await this._importData();
	}
}
