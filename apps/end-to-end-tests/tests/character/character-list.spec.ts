import { test, expect, sendSlashCommand, waitForBotEmbed } from '../fixtures/discord.fixture.js';

test.describe('/character list', () => {
	test('should display the active character', async ({ discordChannel }) => {
		await sendSlashCommand(discordChannel, '/character list');

		const embed = await waitForBotEmbed(discordChannel);

		// The embed title should indicate it's a character list
		const title = embed.locator('[class*="embedTitle"]');
		await expect(title).toBeVisible();

		// There should be at least one field (the test character set up in character.setup.ts)
		await expect(embed.locator('[class*="embedField"]').first()).toBeVisible();
	});
});
