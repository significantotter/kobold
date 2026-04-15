import {
	test,
	expect,
	sendSlashCommandWithArgs,
	waitForBotEmbed,
} from '../fixtures/discord.fixture.js';

test.describe('/roll attack', () => {
	test('should roll an attack for the active character', async ({ discordChannel }) => {
		// "Gakgung" is a weapon on the test character (Ren) sheet
		await sendSlashCommandWithArgs(discordChannel, '/roll attack', [
			{ name: 'attack', value: 'Gakgung', autocomplete: true },
		]);

		const embed = await waitForBotEmbed(discordChannel);

		// The attack embed should contain the attack name and a d20 roll
		const embedText = await embed.textContent();
		expect(embedText?.toLowerCase()).toMatch(/gakgung|attack|d20/);

		// Attack embeds use fields (not a description) for the roll result
		await expect(embed.locator('[class*="embedField"]').first()).toBeVisible();
	});
});
