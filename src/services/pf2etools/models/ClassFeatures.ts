import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchManyJsonFiles } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import { zClassFeatureSchema, ClassFeature } from './ClassFeatures.zod.js';

export class ClassFeatures extends Model<typeof zClassFeatureSchema, typeof schema.ClassFeatures> {
	public table = schema.ClassFeatures;
	public generateSearchText(resource: ClassFeature): string {
		return `ClassFeature: ${resource.name}`;
	}
	public generateTags(resource: ClassFeature): string[] {
		return [];
	}
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zClassFeatureSchema;
	public getFiles(): any[] {
		return fetchManyJsonFiles('class');
	}
	public resourceListFromFile(file: any): any[] {
		return file.classFeature;
	}
	public async import() {
		await this._importData();
	}
}
