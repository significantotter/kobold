import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import { zOptionalFeatureSchema, OptionalFeature } from './OptionalFeatures.zod.js';

export class OptionalFeatures extends Model<
	typeof zOptionalFeatureSchema,
	typeof schema.OptionalFeatures
> {
	public table = schema.OptionalFeatures;
	public generateSearchText(resource: OptionalFeature): string {
		return `OptionalFeature: ${resource.name}`;
	}
	public generateTags(resource: OptionalFeature): string[] {
		return [];
	}
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
	public async import() {
		await this._importData();
	}
}
