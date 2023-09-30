import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import { zRenderDemoSchema, RenderDemo } from './RenderDemos.zod.js';

export class RenderDemos extends Model<typeof zRenderDemoSchema, typeof schema.RenderDemos> {
	public table = schema.RenderDemos;
	public generateSearchText(resource: RenderDemo): string {
		return `RenderDemo: ${resource.name}`;
	}
	public generateTags(resource: RenderDemo): string[] {
		return [];
	}
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zRenderDemoSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('renderDemos')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.renderDemo;
	}
	public async import() {
		await this._importData();
	}
}
