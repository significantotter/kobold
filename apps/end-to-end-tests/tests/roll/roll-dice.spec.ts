import {
	test,
	expect,
	sendSlashCommandWithArgs,
	waitForBotEmbed,
} from '../fixtures/discord.fixture.js';

test.describe('/roll dice', () => {
	test('should roll a simple dice expression', async ({ discordChannel }) => {
		await sendSlashCommandWithArgs(discordChannel, '/roll dice', [
			{ name: 'dice', value: '1d20' },
		]);

		const embed = await waitForBotEmbed(discordChannel);

		// The roll embed should contain the dice expression and a result
		const description = embed.locator('[class*="embedDescription"]');
		await expect(description).toContainText('1d20');
	});

	test('should roll a complex dice expression', async ({ discordChannel }) => {
		await sendSlashCommandWithArgs(discordChannel, '/roll dice', [
			{ name: 'dice', value: '2d6+5' },
		]);

		const embed = await waitForBotEmbed(discordChannel);

		const description = embed.locator('[class*="embedDescription"]');
		await expect(description).toContainText('2d6');
	});
});
