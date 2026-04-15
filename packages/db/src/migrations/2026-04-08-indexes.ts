import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	// needed for ILIKE acceleration
	await sql`CREATE SCHEMA IF NOT EXISTS extensions`.execute(db);
	await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions`.execute(db);

	// base character filtering
	await sql`CREATE INDEX IF NOT EXISTS idx_character_user_import_source
		ON public."character" USING btree ("user_id", "import_source")`.execute(db);

	await sql`CREATE INDEX IF NOT EXISTS idx_character_name_trgm
		ON public."character" USING gin ("name" extensions.gin_trgm_ops)`.execute(db);

	// correlated subqueries by character_id + scoped ids
	await sql`CREATE INDEX IF NOT EXISTS idx_guild_default_character_character_guild
		ON public."guild_default_character" USING btree ("character_id", "guild_id")`.execute(db);

	await sql`CREATE INDEX IF NOT EXISTS idx_channel_default_character_character_channel
		ON public."channel_default_character" USING btree ("character_id", "channel_id")`.execute(db);

	// OR branches in action/modifier/roll_macro predicates
	await sql`CREATE INDEX IF NOT EXISTS idx_action_sheet_record_id
		ON public."action" USING btree ("sheet_record_id")`.execute(db);
	await sql`CREATE INDEX IF NOT EXISTS idx_action_user_id_null_sheet
		ON public."action" USING btree ("user_id")
		WHERE "sheet_record_id" IS NULL`.execute(db);

	await sql`CREATE INDEX IF NOT EXISTS idx_modifier_sheet_record_id
		ON public."modifier" USING btree ("sheet_record_id")`.execute(db);
	await sql`CREATE INDEX IF NOT EXISTS idx_modifier_user_id_null_sheet
		ON public."modifier" USING btree ("user_id")
		WHERE "sheet_record_id" IS NULL`.execute(db);

	await sql`CREATE INDEX IF NOT EXISTS idx_roll_macro_sheet_record_id
		ON public."roll_macro" USING btree ("sheet_record_id")`.execute(db);
	await sql`CREATE INDEX IF NOT EXISTS idx_roll_macro_user_id_null_sheet
		ON public."roll_macro" USING btree ("user_id")
		WHERE "sheet_record_id" IS NULL`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
	await sql`DROP INDEX IF EXISTS public.idx_roll_macro_user_id_null_sheet`.execute(db);
	await sql`DROP INDEX IF EXISTS public.idx_roll_macro_sheet_record_id`.execute(db);
	await sql`DROP INDEX IF EXISTS public.idx_modifier_user_id_null_sheet`.execute(db);
	await sql`DROP INDEX IF EXISTS public.idx_modifier_sheet_record_id`.execute(db);
	await sql`DROP INDEX IF EXISTS public.idx_action_user_id_null_sheet`.execute(db);
	await sql`DROP INDEX IF EXISTS public.idx_action_sheet_record_id`.execute(db);
	await sql`DROP INDEX IF EXISTS public.idx_channel_default_character_character_channel`.execute(
		db
	);
	await sql`DROP INDEX IF EXISTS public.idx_guild_default_character_character_guild`.execute(db);
	await sql`DROP INDEX IF EXISTS public.idx_character_name_trgm`.execute(db);
	await sql`DROP INDEX IF EXISTS public.idx_character_user_import_source`.execute(db);
	await sql`DROP EXTENSION IF EXISTS pg_trgm`.execute(db);
}
