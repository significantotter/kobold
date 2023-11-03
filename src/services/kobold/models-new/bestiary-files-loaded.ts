import { Kysely, Selectable } from 'kysely';
import Database from '../schemas/kanel/Database.js';
import { Model } from './model.js';
import { BestiaryFilesLoaded } from '../schemas/kanel/BestiaryFilesLoaded.js';

export class BestiaryFilesLoadedModel extends Model<Database['bestiaryFilesLoaded']> {
	constructor(db: Kysely<Database>) {
		super(db);
	}
	public read(args: any): Promise<BestiaryFilesLoaded> {
		return {};
	}
}
