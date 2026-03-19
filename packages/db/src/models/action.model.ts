import { Kysely, sql } from 'kysely';
import { sqlJSON } from '../lib/kysely-json.js';
import {
	Action,
	ActionId,
	ActionUpdate,
	Database,
	NewAction,
	SheetRecordId,
} from '../schemas/index.js';
import { Model } from './model.js';

export class ActionModel extends Model<Database['action']> {
	constructor(db: Kysely<Database>) {
		super(db);
	}

	public async create(args: NewAction): Promise<Action> {
		const result = await this.db
			.insertInto('action')
			.values({
				...args,
				rolls: sqlJSON(args.rolls),
				tags: args.tags !== undefined ? sqlJSON(args.tags) : undefined,
			})
			.returningAll()
			.execute();
		return result[0];
	}

	public async read({ id }: { id: ActionId }): Promise<Action | null> {
		const result = await this.db
			.selectFrom('action')
			.selectAll()
			.where('action.id', '=', id)
			.execute();
		return result[0] ?? null;
	}

	public async readMany({ sheetRecordId }: { sheetRecordId: SheetRecordId }): Promise<Action[]> {
		const result = await this.db
			.selectFrom('action')
			.selectAll()
			.where('action.sheetRecordId', '=', sheetRecordId)
			.execute();
		return result;
	}

	/**
	 * Reads actions for a user with flexible filtering
	 * @param params.userId - The user who owns the actions
	 * @param params.filter - 'all' for all user actions, 'user' for user-wide only (null sheetRecordId),
	 *                        or { sheetRecordId } for specific character/minion
	 */
	public async readManyByUser({
		userId,
		filter = 'all',
	}: {
		userId: string;
		filter?: 'all' | 'user' | { sheetRecordId: SheetRecordId };
	}): Promise<Action[]> {
		let query = this.db.selectFrom('action').selectAll().where('action.userId', '=', userId);

		if (filter === 'user') {
			query = query.where('action.sheetRecordId', 'is', null);
		} else if (typeof filter === 'object' && 'sheetRecordId' in filter) {
			query = query.where('action.sheetRecordId', '=', filter.sheetRecordId);
		}
		// 'all' - no additional filter needed

		return query.execute();
	}

	/**
	 * Reads actions for a user that are either user-wide (null sheetRecordId)
	 * or belong to a specific sheet record. Used when rolling for a character.
	 */
	public async readManyForCharacter({
		userId,
		sheetRecordId,
	}: {
		userId: string;
		sheetRecordId: SheetRecordId;
	}): Promise<Action[]> {
		return this.db
			.selectFrom('action')
			.selectAll()
			.where('action.userId', '=', userId)
			.where(eb =>
				eb.or([
					eb('action.sheetRecordId', 'is', null),
					eb('action.sheetRecordId', '=', sheetRecordId),
				])
			)
			.execute();
	}

	/**
	 * Reads all user-wide actions (sheetRecordId is null)
	 */
	public async readManyUserWide({ userId }: { userId: string }): Promise<Action[]> {
		return this.db
			.selectFrom('action')
			.selectAll()
			.where('action.userId', '=', userId)
			.where('action.sheetRecordId', 'is', null)
			.execute();
	}

	public async update({ id }: { id: ActionId }, args: ActionUpdate): Promise<Action> {
		const result = await this.db
			.updateTable('action')
			.set({
				...args,
				rolls: args.rolls !== undefined ? sqlJSON(args.rolls) : undefined,
				tags: args.tags !== undefined ? sqlJSON(args.tags) : undefined,
			})
			.where('action.id', '=', id)
			.returningAll()
			.executeTakeFirstOrThrow();
		return result;
	}

	public async delete({ id }: { id: ActionId }): Promise<void> {
		const result = await this.db.deleteFrom('action').where('action.id', '=', id).execute();
		if (Number(result[0].numDeletedRows) == 0) throw new Error('No rows deleted');
	}

	public async deleteBySheetRecordId({
		sheetRecordId,
	}: {
		sheetRecordId: SheetRecordId;
	}): Promise<void> {
		await this.db
			.deleteFrom('action')
			.where('action.sheetRecordId', '=', sheetRecordId)
			.execute();
	}
}
