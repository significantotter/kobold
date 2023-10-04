import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import { zOptionalFeatureSchema, OptionalFeature } from './../schemas/index.js';

export class OptionalFeatures extends Model<
	typeof zOptionalFeatureSchema,
	typeof schema.OptionalFeatures
> {
	public table = schema.OptionalFeatures;
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zOptionalFeatureSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('optionalFeatures')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.optionalfeature ?? [];
	}
	public generateSearchText(optionalFeature: OptionalFeature): string {
		return `Optional Feature: ${optionalFeature.name}`;
	}
	public generateTags(optionalFeature: OptionalFeature): string[] {
		return [optionalFeature.source].concat(optionalFeature.traits ?? []);
	}
	public async import() {
		await this._importData();
	}
}
