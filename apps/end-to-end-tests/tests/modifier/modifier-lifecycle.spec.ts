import {
	test,
	expect,
	sendSlashCommandWithArgs,
	waitForBotEmbed,
	waitForBotMessage,
} from '../fixtures/discord.fixture.js';
import {
	cleanupModifiersByName,
	getE2ECharacter,
	getFullSheetRecord,
	resetAdjustedSheetToBase,
} from '../helpers/adjusted-sheet.js';

const MODIFIER_NAME = `E2E Mod ${Date.now()}`;

test.describe('modifier lifecycle', () => {
	test('create → list → verify details', async ({ discordChannel }) => {
		// --- Create a modifier with sheet adjustment ---
		// Without create-for, this creates a user-wide modifier. User-wide modifiers
		// are listed, but they do not affect any cached adjusted sheets.
		await sendSlashCommandWithArgs(discordChannel, '/modifier create', [
			{ name: 'name', value: MODIFIER_NAME },
			{ name: 'sheet-values', value: 'ac=+1' },
		]);

		const createMsg = await waitForBotMessage(discordChannel);
		const createText = await createMsg.textContent();
		expect(createText?.toLowerCase()).toContain('created');

		// --- List modifiers ---
		// readManyByUser() returns all modifiers including user-wide
		await sendSlashCommandWithArgs(discordChannel, '/modifier list', []);

		const listEmbed = await waitForBotEmbed(discordChannel);
		const listText = await listEmbed.textContent();
		// Discord/embed may lowercase the modifier name
		expect(listText?.toLowerCase()).toContain(MODIFIER_NAME.toLowerCase());

		// Verify the sheet adjustment detail is shown
		expect(listText?.toLowerCase()).toContain('ac');

		// Verify the modifier appears as active (created modifiers default to active)
		expect(listText?.toLowerCase()).toContain('active');
	});

	test('unassigned sheet modifiers do not change adjusted sheets', async ({ discordChannel }) => {
		const character = await getE2ECharacter();
		const modifierName = `e2e unassigned ac ${Date.now()}`.toLowerCase();
		await resetAdjustedSheetToBase(character.sheetRecordId);
		const initial = await getFullSheetRecord(character.sheetRecordId);
		const baseAc = initial.sheet.intProperties.ac;
		const adjustedAc = initial.adjustedSheet.intProperties.ac;

		try {
			await sendSlashCommandWithArgs(discordChannel, '/modifier create', [
				{ name: 'name', value: modifierName },
				{ name: 'sheet-values', value: 'ac +5' },
			]);

			const createMsg = await waitForBotMessage(discordChannel);
			expect((await createMsg.textContent())?.toLowerCase()).toContain('created');

			await new Promise(resolve => setTimeout(resolve, 1_000));
			const after = await getFullSheetRecord(character.sheetRecordId);
			expect(after.sheet.intProperties.ac).toBe(baseAc);
			expect(after.adjustedSheet.intProperties.ac).toBe(adjustedAc);
		} finally {
			await cleanupModifiersByName(modifierName);
		}
	});
});
