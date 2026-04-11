import {
	test,
	expect,
	sendSlashCommandWithArgs,
	waitForBotEmbed,
} from '../fixtures/discord.fixture.js';

test.describe('/roll skill', () => {
	test('should roll a skill check for the active character', async ({ discordChannel }) => {
		// Use "stealth" — a real PF2e skill (perception is a check, not a skill)
		await sendSlashCommandWithArgs(discordChannel, '/roll skill', [
			{ name: 'skill', value: 'stealth', autocomplete: true },
		]);

		const embed = await waitForBotEmbed(discordChannel);

		// The roll embed should reference the skill name and show a result
		const description = embed.locator('[class*="embedDescription"]');
		await expect(description).toBeVisible();

		// Verify the embed contains a dice roll result (d20 expression)
		const embedText = await embed.textContent();
		expect(embedText?.toLowerCase()).toMatch(/stealth|d20/);
	});
});
