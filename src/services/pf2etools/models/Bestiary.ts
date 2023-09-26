import { Neboa, Collection } from 'neboa';
import {
	zCreatureSchema,
	Creature,
	zCreatureFluffSchema,
	CreatureFluff as CreatureFluffType,
} from './Bestiary.zod.js';
import { fetchManyJsonFiles, fetchOneJsonFileAndEscape } from './lib/helpers.js';
import { Model } from './lib/Model.js';

export class Creatures extends Model<typeof zCreatureSchema> {
	public collection: Collection<Creature>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<Creature>('creatures');
	}
	public z = zCreatureSchema;
	public getFiles(): any[] {
		return fetchManyJsonFiles('bestiary');
	}
	public resourceListFromFile(file: any): any[] {
		return file.creature ?? [];
	}
	public async import() {
		await this._importData();
	}
}

export class CreatureFluff extends Model<typeof zCreatureFluffSchema> {
	public collection: Collection<CreatureFluffType>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<CreatureFluffType>('creatureFluff');
	}
	public z = zCreatureFluffSchema;
	public getFiles(): any[] {
		return fetchManyJsonFiles('bestiary', 'fluff-index.json');
	}
	public resourceListFromFile(file: any): any[] {
		return file.creatureFluff ?? [];
	}
	public async import() {
		await this._importData();
	}
}
