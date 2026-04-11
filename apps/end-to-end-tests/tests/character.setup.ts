import { test as setup } from '@playwright/test';
import { Config } from '@kobold/config';
import { Kobold, getDialect, ImportSourceEnum, Sheet } from '@kobold/db';
import { default as RenSheet } from './fixtures/data/ren.sheet.json' with { type: 'json' };
import { kobold } from './db.js';
const USER_ID = Config.e2e?.userId ?? '';
const TEST_CHARACTER_NAME = 'E2E Test Character';

/**
 * Ensures a test character exists for the test user.
 * Directly checks the database and inserts a record if none exists.
 */
setup('ensure test character exists', async () => {
	// Check if we already have a character for this user
	const existing = await kobold.character.readManyLite({ userId: USER_ID });
	if (existing.length > 0) {
		return;
	}

	// No characters found — create one directly in the DB
	const sheetRecord = await kobold.sheetRecord.create({
		sheet: RenSheet as Sheet,
	});

	await kobold.character.createReturningId({
		charId: 1,
		name: TEST_CHARACTER_NAME,
		userId: USER_ID,
		sheetRecordId: sheetRecord.id,
		importSource: ImportSourceEnum.pathbuilder,
		isActiveCharacter: true,
	});
});
