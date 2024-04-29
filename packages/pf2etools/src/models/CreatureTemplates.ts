import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import {
	zCreatureTemplateSchema,
	CreatureTemplate,
	zCreatureTemplateFluffSchema,
	CreatureTemplateFluff as CreatureTemplateFluffType,
	CreatureTemplateFluff,
} from '../schemas/index.js';

export class CreatureTemplates extends Model<
	typeof zCreatureTemplateSchema,
	typeof schema.CreatureTemplates
> {
	public table = schema.CreatureTemplates;
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zCreatureTemplateSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('creaturetemplates')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.creatureTemplate ?? [];
	}
	public generateSearchText(creatureTemplate: CreatureTemplate): string {
		return `Creature Template: ${creatureTemplate.name}`;
	}
	public generateTags(creatureTemplate: CreatureTemplate): string[] {
		return [];
	}
	public async import() {
		await this._importData();
	}
}

export class CreatureTemplatesFluff extends Model<
	typeof zCreatureTemplateFluffSchema,
	typeof schema.CreatureTemplatesFluff
> {
	public table = schema.CreatureTemplatesFluff;
	public generateSearchText(resource: CreatureTemplateFluff): string {
		return `CreatureTemplateFluff: ${resource.name}`;
	}
	public generateTags(resource: CreatureTemplateFluff): string[] {
		return [];
	}
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zCreatureTemplateFluffSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('fluff-creaturetemplates')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.creatureTemplateFluff ?? [];
	}
	public async import() {
		await this._importData();
	}
}
