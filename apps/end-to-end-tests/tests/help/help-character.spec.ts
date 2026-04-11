import { test, expect, sendSlashCommand, waitForBotEmbed } from '../fixtures/discord.fixture.js';

test.describe('/help character', () => {
	test('should respond with the Character help embed', async ({ discordChannel }) => {
		await sendSlashCommand(discordChannel, '/help character');

		const embed = await waitForBotEmbed(discordChannel);

		await expect(embed.locator('[class*="embedTitle"]')).toContainText('/character Commands');
	});
});
