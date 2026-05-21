import {
	test,
	expect,
	sendSlashCommandWithArgs,
	waitForBotEmbed,
} from '../fixtures/discord.fixture.js';
import { getE2ECharacter, getFullSheetRecord, signed } from '../helpers/adjusted-sheet.js';

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

	test('should roll a lore used as an attribute', async ({ discordChannel }) => {
		const character = await getE2ECharacter();
		const sheetRecord = await getFullSheetRecord(character.sheetRecordId);
		const lore = sheetRecord.adjustedSheet.additionalSkills.find(
			skill => skill.name === 'Warfare Lore'
		);
		expect(lore).toBeDefined();

		await sendSlashCommandWithArgs(discordChannel, '/roll dice', [
			{ name: 'dice', value: '1d20+[Warfare_Lore]' },
		]);

		const embed = await waitForBotEmbed(discordChannel);
		const embedText = await embed.textContent();
		expect(embedText).toContain(signed(lore?.bonus));
	});
});
