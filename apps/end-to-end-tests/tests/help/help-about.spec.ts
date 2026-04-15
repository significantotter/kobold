import { test, expect, sendSlashCommand, waitForBotEmbed } from '../fixtures/discord.fixture.js';

test.describe('/help about', () => {
	test('should respond with the About Kobold embed', async ({ discordChannel }) => {
		await sendSlashCommand(discordChannel, '/help about');

		const embed = await waitForBotEmbed(discordChannel);

		// Verify the embed title
		await expect(embed.locator('[class*="embedTitle"]')).toContainText('About Kobold');

		// Verify the embed description mentions Wanderer's Guide
		await expect(embed.locator('[class*="embedDescription"]')).toContainText(
			"Wanderer's Guide"
		);

		// Verify the "Developed by" field is present
		await expect(
			embed.locator('[class*="embedFieldName"]', { hasText: 'Developed by' })
		).toBeVisible();
	});
});
