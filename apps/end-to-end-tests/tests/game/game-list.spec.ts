import { test, expect, sendSlashCommand, waitForBotEmbed } from '../fixtures/discord.fixture.js';

test.describe('/game list', () => {
	test('should display the game list with game names', async ({ discordChannel }) => {
		await sendSlashCommand(discordChannel, '/game list');

		const embed = await waitForBotEmbed(discordChannel);

		// The embed should have a title (game list header)
		const title = embed.locator('[class*="embedTitle"]');
		await expect(title).toBeVisible();

		// The game created in setup should appear
		const embedText = await embed.textContent();
		expect(embedText).toContain('E2E Test Game');
	});
});
