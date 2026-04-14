import {
	test,
	expect,
	sendSlashCommandWithArgs,
	waitForBotEmbed,
} from '../fixtures/discord.fixture.js';

test.describe('/condition list', () => {
	test('should display conditions for the active character', async ({ discordChannel }) => {
		// Target the test character — autocomplete resolves to active character
		await sendSlashCommandWithArgs(discordChannel, '/condition list', [
			{ name: 'target-character', value: 'E2E Test Character', autocomplete: true },
		]);

		const embed = await waitForBotEmbed(discordChannel);

		// The embed title should reference the character's conditions
		const title = embed.locator('[class*="embedTitle"]');
		await expect(title).toBeVisible();

		const embedText = await embed.textContent();
		// Title format: "{Character Name}'s Conditions"
		expect(embedText).toMatch(/condition/i);
	});
});
