import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { zSpellSchema, Spell } from './Spells.zod.js';
import { fetchManyJsonFiles } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';

export class Spells extends Model<typeof zSpellSchema, typeof schema.Spells> {
	public table = schema.Spells;
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zSpellSchema;
	public getFiles(): any[] {
		return fetchManyJsonFiles('spells');
	}
	public resourceListFromFile(file: any): any[] {
		return file.spell ?? [];
	}
	public generateSearchText(spell: Spell): string {
		return `Spell: ${spell.name}`;
	}
	public generateTags(spell: Spell): string[] {
		return [spell.source]
			.concat(spell.traits ?? [])
			.concat(spell.domains?.length ? spell.domains?.map(domain => `domain-${domain}`) : [])
			.concat(spell.traditions ?? []);
	}
	public async import() {
		await this._importData();
	}
}
