import { Ability, zAbilitySchema } from './Abilities.zod.js';
import { Abilities as abilities } from '../pf2eTools.schema.js';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import { parseActivityRaw } from '../parser/compendium-parser-helpers.js';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '../pf2eTools.schema.js';

export class Abilities extends Model<typeof zAbilitySchema, typeof schema.Abilities> {
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zAbilitySchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('abilities')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.ability;
	}
	public table = schema.Abilities;
	public generateSearchText(ability: Ability): string {
		const activityShorthand = parseActivityRaw(ability.activity);
		return `Ability: ${ability.name}${activityShorthand ? ` (${activityShorthand})` : ''}`;
	}
	public generateTags(ability: Ability): string[] {
		return [];
	}
	public import(): Promise<void> {
		return this._importData();
	}
}
