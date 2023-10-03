import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { zFeatSchema, Feat } from './Feats.zod.js';
import { fetchManyJsonFiles } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import _ from 'lodash';

export class Feats extends Model<typeof zFeatSchema, typeof schema.Feats> {
	public table = schema.Feats;
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zFeatSchema;
	public getFiles(): any[] {
		return fetchManyJsonFiles('feats');
	}
	public resourceListFromFile(file: any): any[] {
		return file.feat ?? [];
	}
	public generateSearchText(feat: Feat): string {
		return `Feat: ${feat.name}`;
	}
	public generateTags(feat: Feat): string[] {
		return _.uniq(
			[feat.source]
				.concat(feat.traits ?? [])
				.concat([feat.featType?.archetype ?? []].flat())
				.concat(feat.featType?.skill ?? [])
		);
	}
	public async import() {
		await this._importData();
	}
}
