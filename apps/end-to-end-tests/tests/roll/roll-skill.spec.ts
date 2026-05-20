import {
	test,
	expect,
	sendSlashCommandWithArgs,
	waitForBotEmbed,
} from '../fixtures/discord.fixture.js';
import { getE2ECharacter, getFullSheetRecord, signed } from '../helpers/adjusted-sheet.js';

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

	test('should roll a lore skill for the active character', async ({ discordChannel }) => {
		const character = await getE2ECharacter();
		const sheetRecord = await getFullSheetRecord(character.sheetRecordId);
		const lore = sheetRecord.adjustedSheet.additionalSkills.find(
			skill => skill.name === 'Warfare Lore'
		);
		expect(lore).toBeDefined();

		await sendSlashCommandWithArgs(discordChannel, '/roll skill', [
			{ name: 'skill', value: 'Warfare Lore', autocomplete: true },
		]);

		const embed = await waitForBotEmbed(discordChannel);
		const embedText = await embed.textContent();
		expect(embedText?.toLowerCase()).toContain('warfare lore');
		expect(embedText).toContain(signed(lore?.bonus));
	});
});
