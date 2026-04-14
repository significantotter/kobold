import {
	test,
	expect,
	sendSlashCommandWithArgs,
	waitForBotEmbed,
	waitForBotMessage,
} from '../fixtures/discord.fixture.js';

const MODIFIER_NAME = `E2E Mod ${Date.now()}`;

test.describe('modifier lifecycle', () => {
	test('create → list → verify details', async ({ discordChannel }) => {
		// --- Create a modifier with sheet adjustment ---
		// Without create-for, this creates a user-wide modifier.
		// This triggers adjustedSheetService.triggerRecompute()
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
});
