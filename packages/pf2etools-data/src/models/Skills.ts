import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import * as schema from '../pf2eTools.schema.js';
import { zSkillSchema, Skill } from './../schemas/index.js';

export class Skills extends Model<typeof zSkillSchema, typeof schema.Skills> {
	public table = schema.Skills;
	constructor(public db: BetterSQLite3Database<typeof schema>) {
		super();
	}
	public z = zSkillSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('skills')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.skill;
	}
	public generateSearchText(skill: Skill): string {
		return `Skill: ${skill.name}`;
	}
	public generateTags(skill: Skill): string[] {
		return [skill.source];
	}
	public async import() {
		await this._importData();
	}
}
