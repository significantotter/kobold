import { Kysely } from 'kysely';
import Database from '../schemas/kanel/Database.js';
import { Model } from './model.js';
import {
	BestiaryFilesLoaded,
	BestiaryFilesLoadedId,
	BestiaryFilesLoadedUpdate,
	NewBestiaryFilesLoaded,
} from '../schemas/kanel/BestiaryFilesLoaded.js';

export class BestiaryFilesLoadedModel extends Model<Database['bestiaryFilesLoaded']> {
	constructor(db: Kysely<Database>) {
		super(db);
	}

	public async create(args: NewBestiaryFilesLoaded): Promise<BestiaryFilesLoaded> {
		const result = await this.db
			.insertInto('bestiaryFilesLoaded')
			.values(args)
			.returningAll()
			.execute();
		return result[0];
	}

	public async read({ id }: { id: number }): Promise<BestiaryFilesLoaded | null> {
		const result = await this.db
			.selectFrom('bestiaryFilesLoaded')
			.selectAll()
			.where('bestiaryFilesLoaded.id', '=', id)
			.execute();
		return result[0] ?? null;
	}

	public async update(
		{ id }: { id: BestiaryFilesLoadedId },
		args: BestiaryFilesLoadedUpdate
	): Promise<BestiaryFilesLoaded> {
		const result = await this.db
			.updateTable('bestiaryFilesLoaded')
			.set(args)
			.where('bestiaryFilesLoaded.id', '=', id)
			.returningAll()
			.execute();
		return result[0];
	}

	public async delete({ id }: { id: BestiaryFilesLoadedId }): Promise<void> {
		await this.db
			.deleteFrom('bestiaryFilesLoaded')
			.where('bestiaryFilesLoaded.id', '=', id)
			.execute();
	}
}
