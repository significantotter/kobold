import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchManyJsonFiles } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import { zClassFeatureSchema, ClassFeature } from './../schemas/index.js';

export class ClassFeatures extends Model<typeof zClassFeatureSchema, typeof schema.ClassFeatures> {
	public table = schema.ClassFeatures;
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
	public generateSearchText(classFeature: ClassFeature): string {
		return `${classFeature.className} Feature: ${classFeature.name}`;
	}
	public generateTags(classFeature: ClassFeature): string[] {
		return [classFeature.source];
	}
	public async import() {
		await this._importData();
	}
}
