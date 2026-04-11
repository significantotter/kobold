import { test, expect, sendSlashCommand, waitForBotEmbed } from '../fixtures/discord.fixture.js';

test.describe('/help faq', () => {
	test('should respond with the FAQ embed', async ({ discordChannel }) => {
		await sendSlashCommand(discordChannel, '/help faq');

		const embed = await waitForBotEmbed(discordChannel);

		await expect(embed.locator('[class*="embedTitle"]')).toContainText(
			'Frequently Asked Questions'
		);
	});
});
