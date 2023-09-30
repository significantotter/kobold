import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { zEventSchema, Event } from './Events.zod.js';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';

export class Events extends Model<typeof zEventSchema, typeof schema.Events> {
	public table = schema.Events;
	public generateSearchText(resource: Event): string {
		return `Event: ${resource.name}`;
	}
	public generateTags(resource: Event): string[] {
		return [];
	}
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zEventSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('events')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.event ?? [];
	}
	public async import() {
		await this._importData();
	}
}
