import { Neboa, Collection } from 'neboa';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import {
	zCreatureTemplateSchema,
	CreatureTemplate,
	zCreatureTemplateFluffSchema,
	CreatureTemplateFluff as CreatureTemplateFluffType,
} from './CreatureTemplates.zod.js';

export class CreatureTemplates extends Model<typeof zCreatureTemplateSchema> {
	public collection: Collection<CreatureTemplate>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<CreatureTemplate>('creatureTemplates');
	}
	public z = zCreatureTemplateSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('creaturetemplates')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.creatureTemplate ?? [];
	}
	public async import() {
		await this._importData();
	}
}

export class CreatureTemplatesFluff extends Model<typeof zCreatureTemplateFluffSchema> {
	public collection: Collection<CreatureTemplateFluffType>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<CreatureTemplateFluffType>('creatureTemplatesFluff');
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
