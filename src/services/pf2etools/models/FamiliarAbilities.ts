import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import { zFamiliarAbilitySchema, FamiliarAbility } from './FamiliarAbilities.zod.js';

export class FamiliarAbilities extends Model<
	typeof zFamiliarAbilitySchema,
	typeof schema.FamiliarAbilities
> {
	public table = schema.FamiliarAbilities;
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zFamiliarAbilitySchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('companionsfamiliars')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.familiarAbility;
	}
	public generateSearchText(familiarAbility: FamiliarAbility): string {
		return `Familiar Ability: ${familiarAbility.name}`;
	}
	public generateTags(familiarAbility: FamiliarAbility): string[] {
		return [familiarAbility.source, familiarAbility.type];
	}
	public async import() {
		await this._importData();
	}
}
