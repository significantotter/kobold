import {
	test,
	expect,
	sendSlashCommand,
	sendSlashCommandWithArgs,
	waitForBotEmbed,
	waitForBotMessage,
	clickBotButton,
} from '../fixtures/discord.fixture.js';

const MINION_NAME = `E2E Minion ${Date.now()}`;

test.describe('minion lifecycle', () => {
	test('create → list → remove', async ({ discordChannel }) => {
		// --- Create a minion ---
		// The "creature" option is autocomplete-based (compendium search).
		// Use a common creature that should exist in the compendium.
		await sendSlashCommandWithArgs(discordChannel, '/minion create', [
			{ name: 'creature', value: 'Giant Rat', autocomplete: true },
			{ name: 'name', value: MINION_NAME },
		]);

		const createMsg = await waitForBotMessage(discordChannel);
		const createText = await createMsg.textContent();
		expect(createText?.toLowerCase()).toContain('created');

		// --- List minions ---
		await sendSlashCommand(discordChannel, '/minion list');

		const listEmbed = await waitForBotEmbed(discordChannel);
		const listText = await listEmbed.textContent();
		expect(listText).toContain(MINION_NAME);

		// --- Remove the minion ---
		await sendSlashCommandWithArgs(discordChannel, '/minion remove', [
			{ name: 'minion', value: MINION_NAME, autocomplete: true },
		]);

		// The remove command asks for confirmation via a button
		await clickBotButton(discordChannel, /confirm|yes|remove/i);

		// Wait for the final removal confirmation
		const removeMsg = await waitForBotMessage(discordChannel);
		const removeText = await removeMsg.textContent();
		expect(removeText?.toLowerCase()).toContain('removed');
	});
});
