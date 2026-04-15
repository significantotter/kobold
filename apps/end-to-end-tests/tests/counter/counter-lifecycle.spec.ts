import {
	test,
	expect,
	sendSlashCommandWithArgs,
	waitForBotEmbed,
	waitForBotMessage,
	clickBotButton,
} from '../fixtures/discord.fixture.js';

const COUNTER_NAME = `E2E Test Counter ${Date.now()}`;

test.describe('counter lifecycle', () => {
	test('create → reset → remove', async ({ discordChannel }) => {
		// --- Create a counter with a max value ---
		// Options: name (required text), then optional fields.
		// After typing the name, Tab to "max" and type a value.
		await sendSlashCommandWithArgs(discordChannel, '/counter create', [
			{ name: 'name', value: COUNTER_NAME },
		]);

		const createMsg = await waitForBotMessage(discordChannel);
		const createText = await createMsg.textContent();
		expect(createText?.toLowerCase()).toContain('created');

		// --- Reset the counter ---
		await sendSlashCommandWithArgs(discordChannel, '/counter reset', [
			{ name: 'name', value: COUNTER_NAME, autocomplete: true },
		]);

		const resetEmbed = await waitForBotEmbed(discordChannel);
		await expect(resetEmbed).toBeVisible();

		// --- Remove the counter ---
		await sendSlashCommandWithArgs(discordChannel, '/counter remove', [
			{ name: 'name', value: COUNTER_NAME, autocomplete: true },
		]);

		// The remove command asks for confirmation via a button
		await clickBotButton(discordChannel, /confirm|yes|remove/i);

		// Wait for the final removal confirmation
		const removeMsg = await waitForBotMessage(discordChannel);
		const removeText = await removeMsg.textContent();
		expect(removeText?.toLowerCase()).toContain('removed');
	});
});
