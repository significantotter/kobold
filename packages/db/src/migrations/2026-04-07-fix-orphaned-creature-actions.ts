import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	// Fix: Change ON DELETE SET NULL to ON DELETE CASCADE for action, modifier, and roll_macro
	// sheet_record_id foreign keys. The SET NULL behavior causes creature actions to become
	// "user-wide" when their sheet record is deleted (e.g. on initiative end), which then
	// makes them appear on the user's characters.

	// action.sheet_record_id: SET NULL -> CASCADE
	await db.schema
		.alterTable('action')
		.dropConstraint('action_sheet_record_id_fkey')
		.ifExists()
		.execute();
	await db.schema
		.alterTable('action')
		.addForeignKeyConstraint(
			'action_sheet_record_id_fkey',
			['sheet_record_id'],
			'sheet_record',
			['id']
		)
		.onDelete('cascade')
		.execute();

	// modifier.sheet_record_id: SET NULL -> CASCADE
	await db.schema
		.alterTable('modifier')
		.dropConstraint('modifier_sheet_record_id_fkey')
		.ifExists()
		.execute();
	await db.schema
		.alterTable('modifier')
		.addForeignKeyConstraint(
			'modifier_sheet_record_id_fkey',
			['sheet_record_id'],
			'sheet_record',
			['id']
		)
		.onDelete('cascade')
		.execute();

	// roll_macro.sheet_record_id: SET NULL -> CASCADE
	await db.schema
		.alterTable('roll_macro')
		.dropConstraint('roll_macro_sheet_record_id_fkey')
		.ifExists()
		.execute();
	await db.schema
		.alterTable('roll_macro')
		.addForeignKeyConstraint(
			'roll_macro_sheet_record_id_fkey',
			['sheet_record_id'],
			'sheet_record',
			['id']
		)
		.onDelete('cascade')
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	// Revert to ON DELETE SET NULL

	await db.schema
		.alterTable('action')
		.dropConstraint('action_sheet_record_id_fkey')
		.ifExists()
		.execute();
	await db.schema
		.alterTable('action')
		.addForeignKeyConstraint(
			'action_sheet_record_id_fkey',
			['sheet_record_id'],
			'sheet_record',
			['id']
		)
		.onDelete('set null')
		.execute();

	await db.schema
		.alterTable('modifier')
		.dropConstraint('modifier_sheet_record_id_fkey')
		.ifExists()
		.execute();
	await db.schema
		.alterTable('modifier')
		.addForeignKeyConstraint(
			'modifier_sheet_record_id_fkey',
			['sheet_record_id'],
			'sheet_record',
			['id']
		)
		.onDelete('set null')
		.execute();

	await db.schema
		.alterTable('roll_macro')
		.dropConstraint('roll_macro_sheet_record_id_fkey')
		.ifExists()
		.execute();
	await db.schema
		.alterTable('roll_macro')
		.addForeignKeyConstraint(
			'roll_macro_sheet_record_id_fkey',
			['sheet_record_id'],
			'sheet_record',
			['id']
		)
		.onDelete('set null')
		.execute();
}
