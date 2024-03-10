import { Kysely } from 'kysely';
import { sqlJSON } from '../lib/kysely-json.js';
import {
	Database,
	NewSheetRecord,
	SheetRecord,
	SheetRecordId,
	SheetRecordUpdate,
} from '../schemas/index.js';
import { Model } from './model.js';

export class SheetRecordModel extends Model<Database['sheetRecord']> {
	constructor(db: Kysely<Database>) {
		super(db);
	}

	public async create(args: NewSheetRecord): Promise<SheetRecord> {
		const result = await this.db
			.insertInto('sheetRecord')
			.values({
				...args,
				modifiers: args.modifiers !== undefined ? sqlJSON(args.modifiers) : undefined,
				actions: args.modifiers !== undefined ? sqlJSON(args.actions) : undefined,
				rollMacros: args.modifiers !== undefined ? sqlJSON(args.rollMacros) : undefined,
			})
			.returningAll()
			.execute();
		return result[0];
	}

	public async read({ id }: { id: SheetRecordId }): Promise<SheetRecord | null> {
		const result = await this.db
			.selectFrom('sheetRecord')
			.selectAll()
			.where('sheetRecord.id', '=', id)
			.execute();
		return result[0] ?? null;
	}

	public async update(
		{ id }: { id: SheetRecordId },
		args: SheetRecordUpdate
	): Promise<SheetRecord> {
		const result = await this.db
			.updateTable('sheetRecord')
			.set({
				...args,
				modifiers: args.modifiers !== undefined ? sqlJSON(args.modifiers) : undefined,
				actions: args.actions !== undefined ? sqlJSON(args.actions) : undefined,
				rollMacros: args.rollMacros !== undefined ? sqlJSON(args.rollMacros) : undefined,
			})
			.where('sheetRecord.id', '=', id)
			.returningAll()
			.executeTakeFirstOrThrow();
		return result;
	}

	public async delete({ id }: { id: SheetRecordId }): Promise<void> {
		const result = await this.db
			.deleteFrom('sheetRecord')
			.where('sheetRecord.id', '=', id)
			.execute();
		if (Number(result[0].numDeletedRows) == 0) throw new Error('No rows deleted');
	}
}
