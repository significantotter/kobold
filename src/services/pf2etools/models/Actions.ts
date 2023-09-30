import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { zActionSchema, Action } from './Actions.zod.js';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import { parseActivityRaw } from '../parser/compendium-parser-helpers.js';

export class Actions extends Model<typeof zActionSchema, typeof schema.Actions> {
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zActionSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('actions')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.action;
	}
	public table = schema.Actions;
	public generateSearchText(action: Action): string {
		const activityShorthand = parseActivityRaw(action.activity);
		return `Action: ${action.name}${activityShorthand ? ` (${activityShorthand})` : ''}`;
	}
	public generateTags(action: Action): string[] {
		return [];
	}
	public async import() {
		await this._importData();
	}
}
