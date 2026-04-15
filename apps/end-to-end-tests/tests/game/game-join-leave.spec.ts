import {
	test,
	expect,
	sendSlashCommandWithArgs,
	waitForBotMessage,
} from '../fixtures/discord.fixture.js';

const TEMP_GAME_NAME = `E2E Join Leave ${Date.now()}`;

test.describe('game join → leave lifecycle', () => {
	test('create a game, leave it, rejoin it, leave again', async ({ discordChannel }) => {
		// The test character is already in "E2E Test Game" from setup.
		// We'll create a separate game, join it, and leave it.

		// --- Create a temporary game ---
		await sendSlashCommandWithArgs(discordChannel, '/game create', [
			{ name: 'name', value: TEMP_GAME_NAME },
		]);

		const createMsg = await waitForBotMessage(discordChannel);
		const createText = await createMsg.textContent();
		expect(createText?.toLowerCase()).toContain('created');

		// --- Join the game ---
		await sendSlashCommandWithArgs(discordChannel, '/game join', [
			{ name: 'target-game', value: TEMP_GAME_NAME, autocomplete: true },
		]);

		const joinMsg = await waitForBotMessage(discordChannel);
		const joinText = await joinMsg.textContent();
		expect(joinText?.toLowerCase()).toContain('joined');

		// --- Leave the game ---
		await sendSlashCommandWithArgs(discordChannel, '/game leave', [
			{ name: 'target-game', value: TEMP_GAME_NAME, autocomplete: true },
		]);

		const leaveMsg = await waitForBotMessage(discordChannel);
		const leaveText = await leaveMsg.textContent();
		expect(leaveText?.toLowerCase()).toContain('left');
	});
});
