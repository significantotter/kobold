import { test as setup } from '@playwright/test';
import { Config } from '@kobold/config';
import { kobold } from './db.js';
import { sql } from 'kysely';

/**
 * Wipes all data owned by the test user/guild/channel so each test run
 * starts from a clean slate. Runs before any browser-based setup.
 *
 * Deletion order respects foreign-key constraints:
 *   initiative actors/groups → initiative → minions → channel/guild defaults
 *   → actions/modifiers/roll macros → characters → orphaned sheet records
 *   → user settings
 */
setup('clean test user data', async () => {
	if (!Config.e2e?.userId) {
		throw new Error(
			'e2e config (DISCORD_TEST_USER_ID, DISCORD_TEST_GUILD_ID, etc.) must be set in .env. ' +
				'See .env.example for details.'
		);
	}
	if (!Config.database.url) {
		throw new Error('DATABASE_URL must be set in .env to clean test data.');
	}

	const { userId: USER_ID, guildId: GUILD_ID, channelId: CHANNEL_ID } = Config.e2e;

	try {
		await kobold.db.transaction().execute(async trx => {
			// Initiative actors & groups owned by this user
			await trx.deleteFrom('initiativeActor').where('userId', '=', USER_ID).execute();
			await trx.deleteFrom('initiativeActorGroup').where('userId', '=', USER_ID).execute();

			// Initiatives in the test channel (owned by this user as GM)
			if (CHANNEL_ID) {
				await trx
					.deleteFrom('initiative')
					.where('channelId', '=', CHANNEL_ID)
					.where('gmUserId', '=', USER_ID)
					.execute();
			}

			// Minions owned by this user
			await trx.deleteFrom('minion').where('userId', '=', USER_ID).execute();

			// Channel/guild default character overrides
			if (CHANNEL_ID) {
				await trx
					.deleteFrom('channelDefaultCharacter')
					.where('userId', '=', USER_ID)
					.where('channelId', '=', CHANNEL_ID)
					.execute();
			}
			if (GUILD_ID) {
				await trx
					.deleteFrom('guildDefaultCharacter')
					.where('userId', '=', USER_ID)
					.where('guildId', '=', GUILD_ID)
					.execute();
			}

			// Actions, modifiers, roll macros owned by this user
			await trx.deleteFrom('action').where('userId', '=', USER_ID).execute();
			await trx.deleteFrom('modifier').where('userId', '=', USER_ID).execute();
			await trx.deleteFrom('rollMacro').where('userId', '=', USER_ID).execute();

			// Characters owned by this user (remove game association first)
			await trx
				.updateTable('character')
				.set({ gameId: null })
				.where('userId', '=', USER_ID)
				.execute();
			await trx.deleteFrom('character').where('userId', '=', USER_ID).execute();

			// Games owned by this user
			await trx.deleteFrom('game').where('gmUserId', '=', USER_ID).execute();

			// Clean up orphaned sheet records (no character or minion references them)
			await sql`
				DELETE FROM "sheet_record" sr
				WHERE NOT EXISTS (
					SELECT 1 FROM "character" c WHERE c."sheet_record_id" = sr."id"
				)
				AND NOT EXISTS (
					SELECT 1 FROM "minion" m WHERE m."sheet_record_id" = sr."id"
				)
				AND NOT EXISTS (
					SELECT 1 FROM "initiative_actor" ia WHERE ia."sheet_record_id" = sr."id"
				)
			`.execute(trx);

			// User settings
			await trx.deleteFrom('userSettings').where('userId', '=', USER_ID).execute();
		});
	} finally {
		await kobold.db.destroy();
	}
});
