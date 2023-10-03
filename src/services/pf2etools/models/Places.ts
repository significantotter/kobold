import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import { zPlaceSchema, Place } from './Places.zod.js';

export class Places extends Model<typeof zPlaceSchema, typeof schema.Places> {
	public table = schema.Places;
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zPlaceSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('places')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.place;
	}
	public generateSearchText(place: Place): string {
		return `Place: ${place.name}`;
	}
	public generateTags(place: Place): string[] {
		return [place.source].concat(place.traits ?? []);
	}
	public async import() {
		await this._importData();
	}
}
