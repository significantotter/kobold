import { Kysely } from 'kysely';
import { sqlJSON } from '../lib/kysely-json.js';
import {
	Database,
	Modifier,
	ModifierId,
	ModifierUpdate,
	NewModifier,
	SheetRecordId,
} from '../schemas/index.js';
import { Model } from './model.js';

export class ModifierModel extends Model<Database['modifier']> {
	constructor(db: Kysely<Database>) {
		super(db);
	}

	public async create(args: NewModifier): Promise<Modifier> {
		const result = await this.db
			.insertInto('modifier')
			.values({
				...args,
				sheetAdjustments:
					args.sheetAdjustments !== undefined
						? sqlJSON(args.sheetAdjustments)
						: undefined,
			})
			.returningAll()
			.execute();
		return result[0];
	}

	public async read({ id }: { id: ModifierId }): Promise<Modifier | null> {
		const result = await this.db
			.selectFrom('modifier')
			.selectAll()
			.where('modifier.id', '=', id)
			.execute();
		return result[0] ?? null;
	}

	public async readMany({
		sheetRecordId,
	}: {
		sheetRecordId: SheetRecordId;
	}): Promise<Modifier[]> {
		const result = await this.db
			.selectFrom('modifier')
			.selectAll()
			.where('modifier.sheetRecordId', '=', sheetRecordId)
			.execute();
		return result;
	}

	/**
	 * Reads modifiers for a user with flexible filtering
	 * @param params.userId - The user who owns the modifiers
	 * @param params.filter - 'all' for all user modifiers, 'user' for user-wide only (null sheetRecordId),
	 *                        or { sheetRecordId } for specific character/minion
	 */
	public async readManyByUser({
		userId,
		filter = 'all',
	}: {
		userId: string;
		filter?: 'all' | 'user' | { sheetRecordId: SheetRecordId };
	}): Promise<Modifier[]> {
		let query = this.db
			.selectFrom('modifier')
			.selectAll()
			.where('modifier.userId', '=', userId);

		if (filter === 'user') {
			query = query.where('modifier.sheetRecordId', 'is', null);
		} else if (typeof filter === 'object' && 'sheetRecordId' in filter) {
			query = query.where('modifier.sheetRecordId', '=', filter.sheetRecordId);
		}
		// 'all' - no additional filter needed

		return query.execute();
	}

	/**
	 * Reads modifiers that belong to a specific sheet record.
	 * Unassigned (user-wide) modifiers are not included.
	 */
	public async readManyForCharacter({
		userId,
		sheetRecordId,
	}: {
		userId: string;
		sheetRecordId: SheetRecordId;
	}): Promise<Modifier[]> {
		return this.db
			.selectFrom('modifier')
			.selectAll()
			.where('modifier.userId', '=', userId)
			.where('modifier.sheetRecordId', '=', sheetRecordId)
			.execute();
	}

	/**
	 * Reads all modifiers assigned to a specific sheetRecordId (regardless of userId).
	 */
	public async readManyBySheetRecordId({
		sheetRecordId,
	}: {
		sheetRecordId: SheetRecordId;
	}): Promise<Modifier[]> {
		return this.db
			.selectFrom('modifier')
			.selectAll()
			.where('modifier.sheetRecordId', '=', sheetRecordId)
			.execute();
	}

	/**
	 * Reads all user-wide modifiers (sheetRecordId is null)
	 */
	public async readManyUserWide({ userId }: { userId: string }): Promise<Modifier[]> {
		return this.db
			.selectFrom('modifier')
			.selectAll()
			.where('modifier.userId', '=', userId)
			.where('modifier.sheetRecordId', 'is', null)
			.execute();
	}

	public async update({ id }: { id: ModifierId }, args: ModifierUpdate): Promise<Modifier> {
		const result = await this.db
			.updateTable('modifier')
			.set({
				...args,
				sheetAdjustments:
					args.sheetAdjustments !== undefined
						? sqlJSON(args.sheetAdjustments)
						: undefined,
			})
			.where('modifier.id', '=', id)
			.returningAll()
			.executeTakeFirstOrThrow();
		return result;
	}

	public async delete({ id }: { id: ModifierId }): Promise<void> {
		const result = await this.db.deleteFrom('modifier').where('modifier.id', '=', id).execute();
		if (Number(result[0].numDeletedRows) == 0) throw new Error('No rows deleted');
	}

	public async deleteBySheetRecordId({
		sheetRecordId,
	}: {
		sheetRecordId: SheetRecordId;
	}): Promise<void> {
		await this.db
			.deleteFrom('modifier')
			.where('modifier.sheetRecordId', '=', sheetRecordId)
			.execute();
	}
}
