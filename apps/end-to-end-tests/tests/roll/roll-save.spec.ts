import {
	test,
	expect,
	sendSlashCommandWithArgs,
	waitForBotEmbed,
} from '../fixtures/discord.fixture.js';

test.describe('/roll save', () => {
	test('should roll a saving throw for the active character', async ({ discordChannel }) => {
		await sendSlashCommandWithArgs(discordChannel, '/roll save', [
			{ name: 'save', value: 'Fortitude', autocomplete: true },
		]);

		const embed = await waitForBotEmbed(discordChannel);

		// The save embed should reference the save type and show a d20 roll
		const embedText = await embed.textContent();
		expect(embedText?.toLowerCase()).toMatch(/fortitude|d20/);

		const description = embed.locator('[class*="embedDescription"]');
		await expect(description).toBeVisible();
	});
});
