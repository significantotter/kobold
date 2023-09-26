import { Neboa, Collection } from 'neboa';
import { zArchetypeSchema, Archetype } from './Archetypes.zod.js';
import { fetchOneJsonFileAndEscape } from './lib/helpers.js';
import { Model } from './lib/Model.js';

export class Archetypes extends Model<typeof zArchetypeSchema> {
	public collection: Collection<Archetype>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<Archetype>('archetypes');
	}
	public z = zArchetypeSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFileAndEscape('archetypes')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.archetype ?? [];
	}
	public async import() {
		await this._importData();
	}
}
