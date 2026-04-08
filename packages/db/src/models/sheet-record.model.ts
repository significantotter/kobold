import { Kysely } from 'kysely';
import { sqlJSON } from '../lib/kysely-json.js';
import {
	Database,
	NewSheetRecord,
	Sheet,
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
				conditions: args.conditions !== undefined ? sqlJSON(args.conditions) : undefined,
				adjustedSheet:
					args.adjustedSheet !== undefined ? sqlJSON(args.adjustedSheet) : undefined,
			})
			.returningAll()
			.execute();
		return result[0];
	}

	public async read({ id }: { id: SheetRecordId }): Promise<SheetRecord | null> {
		const result = await this.db
			.selectFrom('sheetRecord')
			.select([
				'sheetRecord.id',
				'sheetRecord.sheet',
				'sheetRecord.conditions',
				'sheetRecord.trackerMode',
				'sheetRecord.trackerChannelId',
				'sheetRecord.trackerGuildId',
				'sheetRecord.trackerMessageId',
			])
			.where('sheetRecord.id', '=', id)
			.execute();
		return (result[0] as SheetRecord) ?? null;
	}

	public async update(
		{ id }: { id: SheetRecordId },
		args: SheetRecordUpdate
	): Promise<SheetRecord> {
		const result = await this.db
			.updateTable('sheetRecord')
			.set({
				...args,
				conditions: args.conditions !== undefined ? sqlJSON(args.conditions) : undefined,
				adjustedSheet:
					args.adjustedSheet !== undefined ? sqlJSON(args.adjustedSheet) : undefined,
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

	public async deleteOrphaned() {
		const result = await this.db
			.deleteFrom('sheetRecord')
			.where(eb => {
				const characterExists = eb.exists(ebInner =>
					ebInner
						.selectFrom('character')
						.selectAll()
						.whereRef('character.sheetRecordId', '=', 'sheetRecord.id')
				);
				const initActorExists = eb.exists(ebInner =>
					ebInner
						.selectFrom('initiativeActor')
						.selectAll()
						.whereRef('initiativeActor.sheetRecordId', '=', 'sheetRecord.id')
				);

				return eb.not(eb.or([characterExists, initActorExists]));
			})
			.execute();
		return result[0];
	}
}
