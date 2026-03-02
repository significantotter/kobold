import { Kysely } from 'kysely';
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
