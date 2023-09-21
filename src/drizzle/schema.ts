import {
	pgTable,
	pgEnum,
	serial,
	text,
	integer,
	boolean,
	jsonb,
	timestamp,
	varchar,
	unique,
	numeric,
	index,
	primaryKey,
} from 'drizzle-orm/pg-core';

import { ZCharacter } from '../services/kobold/models/character/character.drizzle.js';
export const keyStatus = pgEnum('key_status', ['default', 'valid', 'invalid', 'expired']);
export const keyType = pgEnum('key_type', [
	'aead-ietf',
	'aead-det',
	'hmacsha512',
	'hmacsha256',
	'auth',
	'shorthash',
	'generichash',
	'kdf',
	'secretbox',
	'secretstream',
	'stream_xchacha20',
]);
export const aalLevel = pgEnum('aal_level', ['aal1', 'aal2', 'aal3']);
export const codeChallengeMethod = pgEnum('code_challenge_method', ['s256', 'plain']);
export const factorStatus = pgEnum('factor_status', ['unverified', 'verified']);
export const factorType = pgEnum('factor_type', ['totp', 'webauthn']);

export const character = pgTable('character', {
	id: serial('id').primaryKey().notNull(),
	userId: text('user_id').notNull(),
	charId: integer('char_id'),
	isActiveCharacter: boolean('is_active_character').notNull().default(true),
	characterData: jsonb('character_data').default({}).$type<ZCharacter['characterData']>(),
	calculatedStats: jsonb('calculated_stats').default({}).$type<ZCharacter['calculatedStats']>(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
	lastUpdatedAt: timestamp('last_updated_at', {
		withTimezone: true,
		mode: 'string',
	}).defaultNow(),
	attributes: jsonb('attributes').default([]).notNull().$type<ZCharacter['attributes']>(),
	customAttributes: jsonb('custom_attributes')
		.default([])
		.notNull()
		.$type<ZCharacter['attributes']>(),
	modifiers: jsonb('modifiers').default([]).notNull().$type<ZCharacter['modifiers']>(),
	actions: jsonb('actions').default([]).notNull().$type<ZCharacter['actions']>(),
	customActions: jsonb('custom_actions').default([]).notNull().$type<ZCharacter['actions']>(),
	rollMacros: jsonb('roll_macros').default([]).notNull().$type<ZCharacter['rollMacros']>(),
	importSource: varchar('import_source', { length: 255 }).notNull(),
	sheet: jsonb('sheet').default({}).notNull().$type<ZCharacter['sheet']>(),
	name: varchar('name', { length: 255 }).notNull(),
	trackerMessageId: varchar('tracker_message_id', { length: 255 }),
	trackerChannelId: varchar('tracker_channel_id', { length: 255 }),
	trackerGuildId: varchar('tracker_guild_id', { length: 255 }),
	trackerMode: pgEnum('tracker_mode', ['counters_only', 'basic_stats', 'full_sheet'])(
		'tracker_mode'
	)
		.notNull()
		.default('counters_only'),
});

export const game = pgTable(
	'game',
	{
		id: serial('id').primaryKey().notNull(),
		gmUserId: text('gm_user_id').notNull(),
		name: text('name'),
		guildId: text('guild_id').notNull(),
		isActive: boolean('is_active').default(false).notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
		lastUpdatedAt: timestamp('last_updated_at', {
			withTimezone: true,
			mode: 'string',
		}).defaultNow(),
	},
	table => {
		return {
			gameNameGuildIdUnique: unique('game_name_guild_id_unique').on(
				table.name,
				table.guildId
			),
		};
	}
);

export const knexMigrations = pgTable('knex_migrations', {
	id: serial('id').primaryKey().notNull(),
	name: varchar('name', { length: 255 }),
	batch: integer('batch'),
	migrationTime: timestamp('migration_time', { withTimezone: true, mode: 'string' }),
});

export const knexMigrationsLock = pgTable('knex_migrations_lock', {
	index: serial('index').primaryKey().notNull(),
	isLocked: integer('is_locked'),
});

export const userSettings = pgTable('user_settings', {
	userId: varchar('user_id', { length: 255 }).primaryKey().notNull(),
	initStatsNotification: text('init_stats_notification').default('whenever_hidden'),
	rollCompactMode: text('roll_compact_mode').default('normal'),
	inlineRollsDisplay: text('inline_rolls_display').default('detailed'),
});

export const wgAuthToken = pgTable('wg_auth_token', {
	id: serial('id').primaryKey().notNull(),
	charId: integer('char_id').notNull(),
	accessToken: text('access_token').notNull(),
	expiresAt: timestamp('expires_at', { mode: 'string' }).notNull(),
	accessRights: text('access_rights').notNull(),
	tokenType: text('token_type').notNull(),
});

export const charactersInGames = pgTable('characters_in_games', {
	gameId: integer('game_id')
		.notNull()
		.references(() => game.id, { onDelete: 'cascade' }),
	characterId: integer('character_id')
		.notNull()
		.references(() => character.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
	lastUpdatedAt: timestamp('last_updated_at', {
		withTimezone: true,
		mode: 'string',
	}).defaultNow(),
});

export const initiativeActor = pgTable('initiative_actor', {
	id: serial('id').primaryKey().notNull(),
	initiativeId: integer('initiative_id')
		.notNull()
		.references(() => initiative.id, { onDelete: 'cascade' }),
	initiativeActorGroupId: integer('initiative_actor_group_id')
		.notNull()
		.references(() => initiativeActorGroup.id, { onDelete: 'cascade' }),
	characterId: integer('character_id').references(() => character.id, { onDelete: 'set null' }),
	userId: text('user_id').notNull(),
	name: text('name').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
	lastUpdatedAt: timestamp('last_updated_at', {
		withTimezone: true,
		mode: 'string',
	}).defaultNow(),
	sheet: jsonb('sheet').default({}),
	referenceNpcName: text('reference_npc_name'),
	hideStats: boolean('hide_stats').default(false).notNull(),
});

export const bestiaryFilesLoaded = pgTable('bestiary_files_loaded', {
	id: serial('id').primaryKey().notNull(),
	fileName: text('file_name'),
	fileHash: text('file_hash'),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
	lastUpdatedAt: timestamp('last_updated_at', {
		withTimezone: true,
		mode: 'string',
	}).defaultNow(),
});

export const initiative = pgTable(
	'initiative',
	{
		id: serial('id').primaryKey().notNull(),
		channelId: text('channel_id').notNull(),
		gmUserId: text('gm_user_id').notNull(),
		roundMessageIds: jsonb('round_message_ids'),
		currentRound: integer('current_round').default(0).notNull(),
		currentTurnGroupId: integer('current_turn_group_id'),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
		lastUpdatedAt: timestamp('last_updated_at', {
			withTimezone: true,
			mode: 'string',
		}).defaultNow(),
	},
	table => {
		return {
			initiativeChannelIdUnique: unique('initiative_channel_id_unique').on(table.channelId),
		};
	}
);

export const initiativeActorGroup = pgTable('initiative_actor_group', {
	id: serial('id').primaryKey().notNull(),
	initiativeId: integer('initiative_id')
		.notNull()
		.references(() => initiative.id, { onDelete: 'cascade' }),
	userId: text('user_id').notNull(),
	name: text('name').notNull(),
	initiativeResult: numeric('initiative_result', { precision: 8, scale: 2 }).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
	lastUpdatedAt: timestamp('last_updated_at', {
		withTimezone: true,
		mode: 'string',
	}).defaultNow(),
});

export const npc = pgTable(
	'npc',
	{
		id: serial('id').primaryKey().notNull(),
		data: jsonb('data').default({}),
		fluff: jsonb('fluff').default({}),
		name: text('name'),
		sourceFileName: text('source_file_name'),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
		lastUpdatedAt: timestamp('last_updated_at', {
			withTimezone: true,
			mode: 'string',
		}).defaultNow(),
	},
	table => {
		return {
			nameIdx: index().on(table.name),
			sourceFileNameIdx: index('source_file_name_index').on(table.sourceFileName),
		};
	}
);

export const guildDefaultCharacter = pgTable(
	'guild_default_character',
	{
		userId: varchar('user_id', { length: 255 }).notNull(),
		characterId: integer('character_id')
			.notNull()
			.references(() => character.id, { onDelete: 'cascade' }),
		guildId: varchar('guild_id', { length: 255 }).notNull(),
	},
	table => {
		return {
			guildDefaultCharacterPkey: primaryKey(table.userId, table.guildId),
		};
	}
);

export const channelDefaultCharacter = pgTable(
	'channel_default_character',
	{
		userId: varchar('user_id', { length: 255 }).notNull(),
		characterId: integer('character_id')
			.notNull()
			.references(() => character.id, { onDelete: 'cascade' }),
		channelId: varchar('channel_id', { length: 255 }).notNull(),
	},
	table => {
		return {
			channelDefaultCharacterPkey: primaryKey(table.userId, table.channelId),
		};
	}
);

export const schema = {
	keyStatus,
	keyType,
	aalLevel,
	codeChallengeMethod,
	factorStatus,
	factorType,
	character,
	game,
	knexMigrations,
	knexMigrationsLock,
	userSettings,
	wgAuthToken,
	charactersInGames,
	initiativeActor,
	bestiaryFilesLoaded,
	initiative,
	initiativeActorGroup,
	npc,
	guildDefaultCharacter,
	channelDefaultCharacter,
};

export type schema = typeof schema;
