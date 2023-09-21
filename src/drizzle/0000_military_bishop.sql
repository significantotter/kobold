-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
DO $$ BEGIN
 CREATE TYPE "key_status" AS ENUM('default', 'valid', 'invalid', 'expired');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "key_type" AS ENUM('aead-ietf', 'aead-det', 'hmacsha512', 'hmacsha256', 'auth', 'shorthash', 'generichash', 'kdf', 'secretbox', 'secretstream', 'stream_xchacha20');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "aal_level" AS ENUM('aal1', 'aal2', 'aal3');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "code_challenge_method" AS ENUM('s256', 'plain');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "factor_status" AS ENUM('unverified', 'verified');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "factor_type" AS ENUM('totp', 'webauthn');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "character" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"char_id" integer,
	"is_active_character" boolean DEFAULT true,
	"character_data" jsonb DEFAULT '{}'::jsonb,
	"calculated_stats" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"last_updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"attributes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"custom_attributes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"modifiers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"actions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"custom_actions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"roll_macros" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"import_source" varchar(255) DEFAULT 'wg'::character varying,
	"sheet" jsonb DEFAULT '{}'::jsonb,
	"name" varchar(255),
	"tracker_message_id" varchar(255) DEFAULT NULL::character varying,
	"tracker_channel_id" varchar(255) DEFAULT NULL::character varying,
	"tracker_guild_id" varchar(255) DEFAULT NULL::character varying,
	"tracker_mode" text DEFAULT 'counters_only'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "game" (
	"id" serial PRIMARY KEY NOT NULL,
	"gm_user_id" text NOT NULL,
	"name" text,
	"guild_id" text NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"last_updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "game_name_guild_id_unique" UNIQUE("name","guild_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "knex_migrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"batch" integer,
	"migration_time" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "knex_migrations_lock" (
	"index" serial PRIMARY KEY NOT NULL,
	"is_locked" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_settings" (
	"user_id" varchar(255) PRIMARY KEY NOT NULL,
	"init_stats_notification" text DEFAULT 'whenever_hidden',
	"roll_compact_mode" text DEFAULT 'normal',
	"inline_rolls_display" text DEFAULT 'detailed'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wg_auth_token" (
	"id" serial PRIMARY KEY NOT NULL,
	"char_id" integer NOT NULL,
	"access_token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"access_rights" text NOT NULL,
	"token_type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bestiary_files_loaded" (
	"id" serial PRIMARY KEY NOT NULL,
	"file_name" text,
	"file_hash" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"last_updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "characters_in_games" (
	"game_id" integer NOT NULL,
	"character_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"last_updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "initiative" (
	"id" serial PRIMARY KEY NOT NULL,
	"channel_id" text NOT NULL,
	"gm_user_id" text NOT NULL,
	"round_message_ids" jsonb,
	"current_round" integer DEFAULT 0 NOT NULL,
	"current_turn_group_id" integer,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"last_updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "initiative_channel_id_unique" UNIQUE("channel_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "initiative_actor" (
	"id" serial PRIMARY KEY NOT NULL,
	"initiative_id" integer NOT NULL,
	"initiative_actor_group_id" integer NOT NULL,
	"character_id" integer,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"last_updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"sheet" jsonb DEFAULT '{}'::jsonb,
	"reference_npc_name" text,
	"hide_stats" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "initiative_actor_group" (
	"id" serial PRIMARY KEY NOT NULL,
	"initiative_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"initiative_result" numeric(8, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"last_updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "npc" (
	"id" serial PRIMARY KEY NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb,
	"fluff" jsonb DEFAULT '{}'::jsonb,
	"name" text,
	"source_file_name" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"last_updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channel_default_character" (
	"user_id" varchar(255) NOT NULL,
	"character_id" integer NOT NULL,
	"channel_id" varchar(255) NOT NULL,
	CONSTRAINT channel_default_character_pkey PRIMARY KEY("user_id","channel_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "guild_default_character" (
	"user_id" varchar(255) NOT NULL,
	"character_id" integer NOT NULL,
	"guild_id" varchar(255) NOT NULL,
	CONSTRAINT guild_default_character_pkey PRIMARY KEY("user_id","guild_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "npc_name_index" ON "npc" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "source_file_name_index" ON "npc" ("source_file_name");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "characters_in_games" ADD CONSTRAINT "characters_in_games_character_id_foreign" FOREIGN KEY ("character_id") REFERENCES "character"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "characters_in_games" ADD CONSTRAINT "characters_in_games_game_id_foreign" FOREIGN KEY ("game_id") REFERENCES "game"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "initiative_actor" ADD CONSTRAINT "initiative_actor_character_id_foreign" FOREIGN KEY ("character_id") REFERENCES "character"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "initiative_actor" ADD CONSTRAINT "initiative_actor_initiative_actor_group_id_foreign" FOREIGN KEY ("initiative_actor_group_id") REFERENCES "initiative_actor_group"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "initiative_actor" ADD CONSTRAINT "initiative_actor_initiative_id_foreign" FOREIGN KEY ("initiative_id") REFERENCES "initiative"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "initiative_actor_group" ADD CONSTRAINT "initiative_actor_group_initiative_id_foreign" FOREIGN KEY ("initiative_id") REFERENCES "initiative"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "channel_default_character" ADD CONSTRAINT "channel_default_character_character_id_foreign" FOREIGN KEY ("character_id") REFERENCES "character"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "guild_default_character" ADD CONSTRAINT "guild_default_character_character_id_foreign" FOREIGN KEY ("character_id") REFERENCES "character"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

*/