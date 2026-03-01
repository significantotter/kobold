import { Kysely } from 'kysely';
import { sqlJSON } from '../lib/kysely-json.js';
import { sheetRelationsForMinion } from '../lib/shared-relation-builders.js';
import {
	CharacterId,
	Database,
	MinionId,
	MinionUpdate,
	MinionWithRelations,
	NewMinion,
} from '../schemas/index.js';
import { Model } from './model.js';

export class MinionModel extends Model<Database['minion']> {
	constructor(db: Kysely<Database>) {
		super(db);
	}

	public async create(args: NewMinion): Promise<MinionWithRelations> {
		const result = await this.db
			.insertInto('minion')
			.values({
				...args,
				sheet: sqlJSON(args.sheet),
			})
			.returningAll()
			.returning(eb => [...sheetRelationsForMinion(eb)])
			.execute();
		return result[0];
	}

	public async read({ id }: { id: MinionId }): Promise<MinionWithRelations | null> {
		const result = await this.db
			.selectFrom('minion')
			.selectAll()
			.select(eb => [...sheetRelationsForMinion(eb)])
			.where('minion.id', '=', id)
			.execute();
		return result[0] ?? null;
	}

	public async readMany({
		characterId,
	}: {
		characterId: CharacterId;
	}): Promise<MinionWithRelations[]> {
		const result = await this.db
			.selectFrom('minion')
			.selectAll()
			.select(eb => [...sheetRelationsForMinion(eb)])
			.where('minion.characterId', '=', characterId)
			.execute();
		return result;
	}

	public async update(
		{ id }: { id: MinionId },
		args: MinionUpdate
	): Promise<MinionWithRelations> {
		const result = await this.db
			.updateTable('minion')
			.set({
				...args,
				sheet: args.sheet !== undefined ? sqlJSON(args.sheet) : undefined,
			})
			.where('minion.id', '=', id)
			.returningAll()
			.returning(eb => [...sheetRelationsForMinion(eb)])
			.executeTakeFirstOrThrow();
		return result;
	}

	public async delete({ id }: { id: MinionId }): Promise<void> {
		const result = await this.db.deleteFrom('minion').where('minion.id', '=', id).execute();
		if (Number(result[0].numDeletedRows) == 0) throw new Error('No rows deleted');
	}

	public async deleteByCharacterId({ characterId }: { characterId: CharacterId }): Promise<void> {
		await this.db.deleteFrom('minion').where('minion.characterId', '=', characterId).execute();
	}
}
