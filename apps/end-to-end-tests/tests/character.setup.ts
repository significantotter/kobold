import { test as setup } from '@playwright/test';
import { Config } from '@kobold/config';
import { Kobold, getDialect, ImportSourceEnum, Sheet } from '@kobold/db';
import { default as RenSheet } from './fixtures/data/ren.sheet.json' with { type: 'json' };
import { kobold } from './db.js';
const USER_ID = Config.e2e?.userId ?? '';
const GUILD_ID = Config.e2e?.guildId ?? '';
const TEST_CHARACTER_NAME = 'E2E Test Character';
const TEST_GAME_NAME = 'E2E Test Game';

/**
 * Ensures a test character exists for the test user, along with an
 * associated game and a populated adjusted_sheet on the sheet record.
 */
setup('ensure test character exists', async () => {
	// Check if we already have a character for this user
	const existing = await kobold.character.readManyLite({ userId: USER_ID });
	if (existing.length > 0) {
		return;
	}

	const sheet = RenSheet as Sheet;

	// No characters found — create one directly in the DB
	// Populate adjustedSheet to match sheet so cached display paths work
	const sheetRecord = await kobold.sheetRecord.create({
		sheet,
		adjustedSheet: sheet,
	});

	// Create a game for game/init tests
	const game = await kobold.game.create({
		name: TEST_GAME_NAME,
		gmUserId: USER_ID,
		guildId: GUILD_ID,
	});

	await kobold.character.createReturningId({
		charId: 1,
		name: TEST_CHARACTER_NAME,
		userId: USER_ID,
		sheetRecordId: sheetRecord.id,
		importSource: ImportSourceEnum.pathbuilder,
		isActiveCharacter: true,
		gameId: game.id,
	});
});
