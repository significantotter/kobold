import {
	test,
	expect,
	sendSlashCommand,
	waitForBotEmbed,
	waitForBotMessage,
	clickBotButton,
} from '../fixtures/discord.fixture.js';

test.describe('initiative lifecycle', () => {
	test('start → show → next → end', async ({ discordChannel }) => {
		// --- Start initiative ---
		// Requires active game with characters; set up in character.setup.ts
		await sendSlashCommand(discordChannel, '/init start');

		const startEmbed = await waitForBotEmbed(discordChannel);
		await expect(startEmbed).toBeVisible();

		// init start shows "Initiative Round 0" — no characters yet
		const startText = await startEmbed.textContent();
		expect(startText).toContain('Round');

		// --- Join initiative so there's an actor to display ---
		await sendSlashCommand(discordChannel, '/init join');
		const joinMsg = await waitForBotMessage(discordChannel);
		await expect(joinMsg).toBeVisible();

		// --- Show initiative (uses cached sheet / lite query) ---
		await sendSlashCommand(discordChannel, '/init show');

		const showEmbed = await waitForBotEmbed(discordChannel);
		await expect(showEmbed).toBeVisible();

		// Verify the initiative tracker shows the character from the adjusted sheet
		const showText = await showEmbed.textContent();
		expect(showText).toContain('E2E Test Character');

		// --- Next turn (uses cached sheet / lite query) ---
		await sendSlashCommand(discordChannel, '/init next');

		// Next sends a response (embed or message) with turn info
		const nextResponse = await waitForBotMessage(discordChannel);
		await expect(nextResponse).toBeVisible();

		// --- End initiative (button confirmation) ---
		await sendSlashCommand(discordChannel, '/init end');

		// The end command shows confirmation buttons
		await clickBotButton(discordChannel, /end/i);

		// Wait for confirmation that initiative ended
		const endMsg = await waitForBotMessage(discordChannel);
		const endText = await endMsg.textContent();
		expect(endText?.toLowerCase()).toMatch(/ended|end/);
	});
});
