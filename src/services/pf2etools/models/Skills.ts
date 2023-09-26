import { Neboa, Collection } from 'neboa';
import { fetchOneJsonFileAndEscape } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import { zSkillSchema, Skill } from './Skills.zod.js';

export class Skills extends Model<typeof zSkillSchema> {
	public collection: Collection<Skill>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<Skill>('skills');
	}
	public z = zSkillSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFileAndEscape('skills')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.skill;
	}
	public async import() {
		await this._importData();
	}
}
