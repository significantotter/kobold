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
