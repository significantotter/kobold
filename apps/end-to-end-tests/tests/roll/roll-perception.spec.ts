import { test, expect, sendSlashCommand, waitForBotEmbed } from '../fixtures/discord.fixture.js';

test.describe('/roll perception', () => {
	test('should roll a perception check for the active character', async ({ discordChannel }) => {
		await sendSlashCommand(discordChannel, '/roll perception');

		const embed = await waitForBotEmbed(discordChannel);

		// The perception embed should reference perception and show a d20 roll
		const embedText = await embed.textContent();
		expect(embedText?.toLowerCase()).toMatch(/perception|d20/);

		const description = embed.locator('[class*="embedDescription"]');
		await expect(description).toBeVisible();
	});
});
