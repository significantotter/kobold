import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	// Create a minion table
	await db.schema
		.createTable('minion')
		.addColumn('id', 'serial', col => col.primaryKey().notNull())
		// Nullable character id for unassigned minions
		.addColumn('character_id', 'integer', col =>
			col.references('character.id').onDelete('set null')
		)
		// Reference to the sheet record for this minion
		.addColumn('sheet_record_id', 'integer', col =>
			col.references('sheet_record.id').onDelete('cascade')
		)
		.addColumn('name', 'text', col => col.notNull())
		.addColumn('sheet', 'jsonb', col => col.notNull())
		.execute();

	// Move actions from the sheet record table to its own table with an optional reference to a sheet record
	// Actions can now exist independently on an account, or can be tied to a specific sheet record.
	await db.schema
		.createTable('action')
		.addColumn('id', 'serial', col => col.primaryKey().notNull())
		.addColumn('sheet_record_id', 'integer', col =>
			col.references('sheet_record.id').onDelete('set null')
		)
		.addColumn('name', 'text', col => col.notNull())
		.addColumn('description', 'text', col => col.notNull().defaultTo(''))
		.addColumn('type', 'text')
		.addColumn('tags', 'jsonb', col => col.notNull().defaultTo(sql`'[]'::JSONB`))
		.addColumn('rolls', 'jsonb', col => col.notNull().defaultTo(sql`'[]'::JSONB`))
		.addColumn('base_level', 'integer')
		.addColumn('action_cost', 'text')
		.addColumn('auto_heighten', 'boolean', col => col.notNull().defaultTo(false))
		.execute();
	// Move modifiers to their own table.
	await db.schema
		.createTable('modifier')
		.addColumn('id', 'serial', col => col.primaryKey().notNull())
		.addColumn('sheet_record_id', 'integer', col =>
			col.references('sheet_record.id').onDelete('set null')
		)
		.addColumn('name', 'text', col => col.notNull())
		.addColumn('type', 'text', col => col.notNull())
		.addColumn('note', 'text')
		.addColumn('is_active', 'boolean', col => col.notNull().defaultTo(false))
		.addColumn('severity', 'integer')
		.addColumn('description', 'text')
		.addColumn('roll_adjustment', 'text')
		.addColumn('roll_target_tags', 'text')
		.addColumn('sheet_adjustments', 'jsonb', col => col.notNull().defaultTo(sql`'[]'::JSONB`))
		.execute();

	// Move roll macros to their own table.
	await db.schema
		.createTable('roll_macro')
		.addColumn('id', 'serial', col => col.primaryKey().notNull())
		.addColumn('sheet_record_id', 'integer', col =>
			col.references('sheet_record.id').onDelete('set null')
		)
		.addColumn('name', 'text', col => col.notNull())
		.addColumn('macro', 'text', col => col.notNull())
		.execute();

	// Migrate existing actions from sheet record table to action table.
	await db.executeQuery(
		sql`
		INSERT INTO action (sheet_record_id, name, description, type, tags, rolls, base_level, action_cost, auto_heighten)
		SELECT
			id as sheet_record_id,
			action->>'name' as name,
			COALESCE(action->>'description', '') as description,
			action->>'type' as type,
			COALESCE(action->'tags', '[]'::jsonb) as tags,
			COALESCE(action->'rolls', '[]'::jsonb) as rolls,
			(action->>'baseLevel')::integer as base_level,
			action->>'actionCost' as action_cost,
			COALESCE((action->>'autoHeighten')::boolean, false) as auto_heighten
		FROM sheet_record,
		jsonb_array_elements(actions) as action
	`.compile(db)
	);

	// Migrate existing modifiers from sheet record table to modifier table.
	await db.executeQuery(
		sql`
		INSERT INTO modifier (sheet_record_id, name, type, note, "is_active", severity, description, "roll_adjustment", "roll_target_tags", "sheet_adjustments")
		SELECT
			id as sheet_record_id,
			modifier->>'name' as name,
			modifier->>'type' as type,
			modifier->>'note' as note,
			COALESCE((modifier->>'isActive')::boolean, false) as "is_active",
			(modifier->>'severity')::integer as severity,
			COALESCE(modifier->>'description', '') as description,
			modifier->>'rollAdjustment' as "roll_adjustment",
			modifier->>'rollTargetTags' as "roll_target_tags",
			COALESCE(modifier->'sheetAdjustments', '[]'::jsonb) as "sheet_adjustments"
		FROM sheet_record,
		jsonb_array_elements(modifiers) as modifier
	`.compile(db)
	);

	// Migrate existing roll macros from sheet record table to roll macro table.
	await db.executeQuery(
		sql`
		INSERT INTO roll_macro (sheet_record_id, name, macro)
		SELECT
			id as sheet_record_id,
			roll_macro->>'name' as name,
			roll_macro->>'macro' as macro
		FROM sheet_record,
		jsonb_array_elements(roll_macros) as roll_macro
	`.compile(db)
	);

	// Remove the actions column from the sheet record table
	await db.schema.alterTable('sheet_record').dropColumn('actions').execute();

	// Remove the modifiers column from the sheet record table
	await db.schema.alterTable('sheet_record').dropColumn('modifiers').execute();

	// Remove the roll_macros column from the sheet record table
	await db.schema.alterTable('sheet_record').dropColumn('roll_macros').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	// Add the actions, modifiers, and roll_macros columns back to the sheet record table
	await db.schema
		.alterTable('sheet_record')
		.addColumn('actions', 'jsonb', col => col.defaultTo(sql`'[]'::JSONB`).notNull())
		.addColumn('modifiers', 'jsonb', col => col.defaultTo(sql`'[]'::JSONB`).notNull())
		.addColumn('roll_macros', 'jsonb', col => col.defaultTo(sql`'[]'::JSONB`).notNull())
		.execute();

	// Migrate actions from the action table back to sheet record table.
	await db.executeQuery(
		sql`
		UPDATE sheet_record
		SET actions = COALESCE((
			SELECT jsonb_agg(jsonb_build_object(
				'name', name,
				'description', description,
				'type', type,
				'tags', tags,
				'rolls', rolls,
				'base_level', base_level,
				'action_cost', action_cost,
				'auto_heighten', auto_heighten
			))
			FROM action
			WHERE action.sheet_record_id = sheet_record.id
		), '[]'::jsonb)
	`.compile(db)
	);

	// Migrate modifiers from the modifier table back to sheet record table.
	await db.executeQuery(
		sql`
		UPDATE sheet_record
		SET modifiers = COALESCE((
			SELECT jsonb_agg(jsonb_build_object(
				'name', name,
				'type', type,
				'note', note,
				'isActive', "is_active",
				'severity', severity,
				'description', description,
				'rollAdjustment', "roll_adjustment",
				'rollTargetTags', "roll_target_tags",
				'sheetAdjustments', "sheet_adjustments"
			))
			FROM modifier
			WHERE modifier.sheet_record_id = sheet_record.id
		), '[]'::jsonb)
	`.compile(db)
	);

	// Migrate roll macros from the roll macro table back to sheet record table.
	await db.executeQuery(
		sql`
		UPDATE sheet_record
		SET roll_macros = COALESCE((
			SELECT jsonb_agg(jsonb_build_object(
				'name', name,
				'macro', macro
			))
			FROM roll_macro
			WHERE roll_macro.sheet_record_id = sheet_record.id
		), '[]'::jsonb)
	`.compile(db)
	);

	// Remove the action, modifier, and roll macro tables
	await db.schema.dropTable('action').execute();
	await db.schema.dropTable('modifier').execute();
	await db.schema.dropTable('roll_macro').execute();

	// Remove the minion table
	await db.schema.dropTable('minion').execute();
}
