import { Kysely } from 'kysely';
import {
	Database,
	NewRollMacro,
	RollMacro,
	RollMacroId,
	RollMacroUpdate,
	SheetRecordId,
} from '../schemas/index.js';
import { Model } from './model.js';

export class RollMacroModel extends Model<Database['rollMacro']> {
	constructor(db: Kysely<Database>) {
		super(db);
	}

	public async create(args: NewRollMacro): Promise<RollMacro> {
		const result = await this.db.insertInto('rollMacro').values(args).returningAll().execute();
		return result[0];
	}

	public async read({ id }: { id: RollMacroId }): Promise<RollMacro | null> {
		const result = await this.db
			.selectFrom('rollMacro')
			.selectAll()
			.where('rollMacro.id', '=', id)
			.execute();
		return result[0] ?? null;
	}

	public async readMany({
		sheetRecordId,
	}: {
		sheetRecordId: SheetRecordId;
	}): Promise<RollMacro[]> {
		const result = await this.db
			.selectFrom('rollMacro')
			.selectAll()
			.where('rollMacro.sheetRecordId', '=', sheetRecordId)
			.execute();
		return result;
	}

	/**
	 * Reads roll macros for a user with flexible filtering
	 * @param params.userId - The user who owns the roll macros
	 * @param params.filter - 'all' for all user roll macros, 'user' for user-wide only (null sheetRecordId),
	 *                        or { sheetRecordId } for specific character/minion
	 */
	public async readManyByUser({
		userId,
		filter = 'all',
	}: {
		userId: string;
		filter?: 'all' | 'user' | { sheetRecordId: SheetRecordId };
	}): Promise<RollMacro[]> {
		let query = this.db
			.selectFrom('rollMacro')
			.selectAll()
			.where('rollMacro.userId', '=', userId);

		if (filter === 'user') {
			query = query.where('rollMacro.sheetRecordId', 'is', null);
		} else if (typeof filter === 'object' && 'sheetRecordId' in filter) {
			query = query.where('rollMacro.sheetRecordId', '=', filter.sheetRecordId);
		}
		// 'all' - no additional filter needed

		return query.execute();
	}

	/**
	 * Reads roll macros for a user that are either user-wide (null sheetRecordId)
	 * or belong to a specific sheet record. Used when rolling for a character.
	 */
	public async readManyForCharacter({
		userId,
		sheetRecordId,
	}: {
		userId: string;
		sheetRecordId: SheetRecordId;
	}): Promise<RollMacro[]> {
		return this.db
			.selectFrom('rollMacro')
			.selectAll()
			.where('rollMacro.userId', '=', userId)
			.where(eb =>
				eb.or([
					eb('rollMacro.sheetRecordId', 'is', null),
					eb('rollMacro.sheetRecordId', '=', sheetRecordId),
				])
			)
			.execute();
	}

	/**
	 * Reads all user-wide roll macros (sheetRecordId is null)
	 */
	public async readManyUserWide({ userId }: { userId: string }): Promise<RollMacro[]> {
		return this.db
			.selectFrom('rollMacro')
			.selectAll()
			.where('rollMacro.userId', '=', userId)
			.where('rollMacro.sheetRecordId', 'is', null)
			.execute();
	}

	public async update({ id }: { id: RollMacroId }, args: RollMacroUpdate): Promise<RollMacro> {
		const result = await this.db
			.updateTable('rollMacro')
			.set(args)
			.where('rollMacro.id', '=', id)
			.returningAll()
			.executeTakeFirstOrThrow();
		return result;
	}

	public async delete({ id }: { id: RollMacroId }): Promise<void> {
		const result = await this.db
			.deleteFrom('rollMacro')
			.where('rollMacro.id', '=', id)
			.execute();
		if (Number(result[0].numDeletedRows) == 0) throw new Error('No rows deleted');
	}

	public async deleteBySheetRecordId({
		sheetRecordId,
	}: {
		sheetRecordId: SheetRecordId;
	}): Promise<void> {
		await this.db
			.deleteFrom('rollMacro')
			.where('rollMacro.sheetRecordId', '=', sheetRecordId)
			.execute();
	}
}
