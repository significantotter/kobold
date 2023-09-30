import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchManyJsonFiles, fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import { zSubclassFeatureSchema, SubclassFeature } from './SubclassFeatures.zod.js';

export class SubclassFeatures extends Model<
	typeof zSubclassFeatureSchema,
	typeof schema.SubclassFeatures
> {
	public table = schema.SubclassFeatures;
	public generateSearchText(resource: SubclassFeature): string {
		return `SubclassFeature: ${resource.name}`;
	}
	public generateTags(resource: SubclassFeature): string[] {
		return [];
	}
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zSubclassFeatureSchema;
	public getFiles(): any[] {
		return fetchManyJsonFiles('class');
	}
	public resourceListFromFile(file: any): any[] {
		return file.subclassFeature;
	}
	public async import() {
		await this._importData();
	}
}
