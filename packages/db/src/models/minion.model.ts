import { Kysely } from 'kysely';
import { sheetRelationsForMinion } from '../lib/shared-relation-builders.js';
import {
	CharacterId,
	Database,
	MinionBasic,
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
			.values(args)
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

	public async readManyByCharacterIds({
		characterIds,
	}: {
		characterIds: CharacterId[];
	}): Promise<MinionWithRelations[]> {
		if (characterIds.length === 0) return [];
		const result = await this.db
			.selectFrom('minion')
			.selectAll()
			.select(eb => [...sheetRelationsForMinion(eb)])
			.where('minion.characterId', 'in', characterIds)
			.execute();
		return result;
	}

	public async readManyByUserId({ userId }: { userId: string }): Promise<MinionWithRelations[]> {
		const result = await this.db
			.selectFrom('minion')
			.selectAll()
			.select(eb => [...sheetRelationsForMinion(eb)])
			.where('minion.userId', '=', userId)
			.execute();
		return result;
	}

	// ========================================================================
	// Lite variants — no sheet relations, just base minion columns.
	// Use for autocomplete, name lookups, existence checks, and filtering.
	// ========================================================================

	public async readManyLite({
		characterId,
	}: {
		characterId: CharacterId;
	}): Promise<MinionBasic[]> {
		return await this.db
			.selectFrom('minion')
			.selectAll()
			.where('minion.characterId', '=', characterId)
			.execute();
	}

	public async readManyByCharacterIdsLite({
		characterIds,
	}: {
		characterIds: CharacterId[];
	}): Promise<MinionBasic[]> {
		if (characterIds.length === 0) return [];
		return await this.db
			.selectFrom('minion')
			.selectAll()
			.where('minion.characterId', 'in', characterIds)
			.execute();
	}

	public async readManyByUserIdLite({ userId }: { userId: string }): Promise<MinionBasic[]> {
		return await this.db
			.selectFrom('minion')
			.selectAll()
			.where('minion.userId', '=', userId)
			.execute();
	}

	public async update(
		{ id }: { id: MinionId },
		args: MinionUpdate
	): Promise<MinionWithRelations> {
		const result = await this.db
			.updateTable('minion')
			.set(args)
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
