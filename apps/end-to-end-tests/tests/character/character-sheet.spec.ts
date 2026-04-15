import { test, expect, sendSlashCommand, waitForBotEmbed } from '../fixtures/discord.fixture.js';

test.describe('/character sheet', () => {
	test('should display the active character sheet', async ({ discordChannel }) => {
		await sendSlashCommand(discordChannel, '/character sheet');

		const embed = await waitForBotEmbed(discordChannel);

		// The sheet embed should contain the character name in the title
		const title = embed.locator('[class*="embedTitle"]');
		await expect(title).toBeVisible();

		// Sheet embeds contain ability scores, HP, level, etc.
		// Verify the embed has field content (stats, abilities)
		await expect(embed.locator('[class*="embedField"]').first()).toBeVisible();
	});
});
