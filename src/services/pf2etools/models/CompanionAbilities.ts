import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { zCompanionAbilitySchema, CompanionAbility } from './CompanionAbilities.zod.js';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';

export class CompanionAbilities extends Model<
	typeof zCompanionAbilitySchema,
	typeof schema.CompanionAbilities
> {
	public table = schema.CompanionAbilities;
	public generateSearchText(resource: CompanionAbility): string {
		return `CompanionAbility: ${resource.name}`;
	}
	public generateTags(resource: CompanionAbility): string[] {
		return [];
	}
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
	public async import() {
		await this._importData();
	}
}
