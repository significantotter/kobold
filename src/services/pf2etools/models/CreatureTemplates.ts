import { Neboa, Collection } from 'neboa';
import { fetchOneJsonFileAndEscape } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import { zCreatureTemplateSchema, CreatureTemplate } from './CreatureTemplates.zod.js';

export class CreatureTemplates extends Model<typeof zCreatureTemplateSchema> {
	public collection: Collection<CreatureTemplate>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<CreatureTemplate>('creatureTemplates');
	}
	public z = zCreatureTemplateSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFileAndEscape('creatureTemplates')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.creatureTemplate ?? [];
	}
	public async import() {
		await this._importData();
	}
}
