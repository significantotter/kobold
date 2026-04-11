import {
	test,
	expect,
	sendSlashCommandWithArgs,
	waitForBotEmbed,
	waitForBotMessage,
	clickBotButton,
} from '../fixtures/discord.fixture.js';

const GROUP_NAME = `E2E Test Group ${Date.now()}`;

test.describe('counter-group lifecycle', () => {
	test('create → duplicate reject → remove', async ({ discordChannel }) => {
		// --- Create a counter group ---
		await sendSlashCommandWithArgs(discordChannel, '/counter-group create', [
			{ name: 'name', value: GROUP_NAME },
		]);

		const createMsg = await waitForBotMessage(discordChannel);
		const createText = await createMsg.textContent();
		expect(createText?.toLowerCase()).toContain('created');

		// --- Try to create a duplicate (same name) ---
		// This exercises the getCounterGroupByName validation fix
		await sendSlashCommandWithArgs(discordChannel, '/counter-group create', [
			{ name: 'name', value: GROUP_NAME },
		]);

		const dupeMsg = await waitForBotMessage(discordChannel);
		const dupeText = await dupeMsg.textContent();
		expect(dupeText?.toLowerCase()).toContain('already exists');

		// --- Remove the counter group ---
		await sendSlashCommandWithArgs(discordChannel, '/counter-group remove', [
			{ name: 'name', value: GROUP_NAME, autocomplete: true },
		]);

		// The remove command asks for confirmation via a button
		await clickBotButton(discordChannel, /confirm|yes|remove/i);

		// Wait for the final removal confirmation
		const removeMsg = await waitForBotMessage(discordChannel);
		const removeText = await removeMsg.textContent();
		expect(removeText?.toLowerCase()).toContain('removed');
	});
});
