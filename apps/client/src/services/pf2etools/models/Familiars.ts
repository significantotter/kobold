import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import { Familiar, zFamiliarSchema } from './../schemas/index.js';
import _ from 'lodash';

export class Familiars extends Model<typeof zFamiliarSchema, typeof schema.Familiars> {
	public table = schema.Familiars;
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zFamiliarSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('companionsfamiliars')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.familiar;
	}
	public generateSearchText(familiar: Familiar): string {
		return `Familiar: ${familiar.name}`;
	}
	public generateTags(familiar: Familiar): string[] {
		const tags = [familiar.source, familiar.alignment].concat(familiar.traits ?? []);
		return tags.filter(_.identity) as string[];
	}
	public async import() {
		await this._importData();
	}
}
