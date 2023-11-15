import { Kysely } from 'kysely';
import { Model } from './model.js';
import {
	Database,
	SheetRecord,
	SheetRecordUpdate,
	SheetRecordId,
	NewSheetRecord,
} from '../schemas/index.js';

export class SheetRecordModel extends Model<Database['sheetRecord']> {
	constructor(db: Kysely<Database>) {
		super(db);
	}

	public async create(args: NewSheetRecord): Promise<SheetRecord> {
		const result = await this.db
			.insertInto('sheetRecord')
			.values(args)
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
			.set(args)
			.where('sheetRecord.id', '=', id)
			.returningAll()
			.execute();
		return result[0];
	}

	public async delete({ id }: { id: SheetRecordId }): Promise<void> {
		await this.db.deleteFrom('sheetRecord').where('sheetRecord.id', '=', id).execute();
	}
}
