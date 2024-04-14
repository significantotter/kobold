import { ExpressionBuilder, Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	// adjust the modifiers to be a single combo roll/sheet modifier
	let sheetRecords: { id: number; modifiers: {} }[] = [];
	let total = (
		await db
			.selectFrom('sheet_record')
			.select(eb => eb.fn.countAll<number>().as('count'))
			.execute()
	)[0]['count'] as number;
	let offset = 0;
	do {
		sheetRecords = await db
			.selectFrom('sheet_record')
			.select(['id', 'modifiers'])
			.orderBy('id')
			.limit(200)
			.offset(offset)
			.execute();
		for (const sheetRecord of sheetRecords) {
			const modifiers = (sheetRecord.modifiers as any).map((modifier: any) => {
				if (modifier.sheetAdjustments === undefined) modifier.sheetAdjustments = [];
				if (modifier.value) modifier.rollAdjustment = modifier.value;
				else modifier.rollAdjustment = null;
				if (modifier.targetTags) modifier.rollTargetTags = modifier.targetTags;
				else modifier.rollTargetTags = null;
				if (modifier.severity === undefined) modifier.severity = null;

				delete modifier.value;
				delete modifier.targetTags;
				delete modifier.modifierType;
				return modifier;
			});
		}
		await db.executeQuery(
			sql`
				update sheet_record set modifiers = new_modifiers.modifiers from
					(
						SELECT 
							(modifier_row ->> 'id')::INTEGER AS id, 
							(modifier_row -> 'modifiers')::JSONB AS modifiers
							FROM (
								SELECT JSONB_ARRAY_ELEMENTS(${JSON.stringify(sheetRecords)}::JSONB) AS modifier_row
							) AS modifier_rows
					) as new_modifiers
				where new_modifiers.id = sheet_record.id;
			`.compile(db)
		);
		offset += sheetRecords.length;
	} while (offset < total);

	// Add the new conditions column
	await db.schema
		.alterTable('sheet_record')
		.addColumn('conditions', 'jsonb', eb => eb.notNull().defaultTo(sql`'[]'::JSONB`))
		.execute();

	await db.executeQuery(
		sql`COMMENT ON COLUMN "sheet_record"."conditions" IS '@type(Modifiers, ''./../kanel-types'', true, false, true)'`.compile(
			db
		)
	);
}

export async function down(db: Kysely<any>): Promise<void> {
	// revert the modifiers back into either roll or sheet modifiers
	let sheetRecords: { id: number; modifiers: {} }[] = [];
	let total = (
		await db
			.selectFrom('sheet_record')
			.select(eb => eb.fn.countAll<number>().as('count'))
			.execute()
	)[0]['count'] as number;
	let offset = 0;
	do {
		sheetRecords = await db
			.selectFrom('sheet_record')
			.select(['id', 'modifiers'])
			.orderBy('id')
			.limit(200)
			.offset(offset)
			.execute();
		for (const sheetRecord of sheetRecords) {
			const modifiers = (sheetRecord.modifiers as any).map((modifier: any) => {
				if (modifier.sheetAdjustments === undefined) modifier.sheetAdjustments = [];
				if (modifier.rollAdjustment) modifier.value = modifier.value;
				else modifier.rollAdjustment = null;
				if (modifier.rollTargetTags) modifier.targetTags = modifier.rollTargetTags;
				else modifier.targetTags = null;
				if (modifier.severity === undefined) modifier.severity = null;

				delete modifier.rollAdjustment;
				delete modifier.rollTargetTags;
				if (modifier.sheetAdjustments?.length === 0) {
					delete modifier.sheetAdjustments;
				}

				if (!modifier.sheetAdjustments) modifier.modifierType = 'roll';
				else modifier.modifierType = 'sheet';
				if (!modifier.rollAdjustment && !modifier.sheetAdjustments) {
					modifier.sheetAdjustments = [];
				}
				return modifier;
			});
		}
		await db.executeQuery(
			sql`
				update sheet_record set modifiers = new_modifiers.modifiers from
					(
						SELECT 
							(modifier_row ->> 'id')::INTEGER AS id, 
							(modifier_row -> 'modifiers')::JSONB AS modifiers
							FROM (
								SELECT JSONB_ARRAY_ELEMENTS(${JSON.stringify(sheetRecords)}::JSONB) AS modifier_row
							) AS modifier_rows
					) as new_modifiers
				where new_modifiers.id = sheet_record.id;
			`.compile(db)
		);
		offset += sheetRecords.length;
	} while (offset < total);

	// remove the new sheet record column
	await db.schema.alterTable('sheet_record').dropColumn('conditions').execute();
	await db.executeQuery(sql`COMMENT ON COLUMN "sheet_record"."conditions" IS ''`.compile(db));
}
