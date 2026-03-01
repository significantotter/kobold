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
				rollTargetTags:
					args.rollTargetTags !== undefined ? sqlJSON(args.rollTargetTags) : undefined,
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

	public async update({ id }: { id: ModifierId }, args: ModifierUpdate): Promise<Modifier> {
		const result = await this.db
			.updateTable('modifier')
			.set({
				...args,
				rollTargetTags:
					args.rollTargetTags !== undefined ? sqlJSON(args.rollTargetTags) : undefined,
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
