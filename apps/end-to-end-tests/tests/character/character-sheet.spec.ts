import {
	test,
	expect,
	sendSlashCommand,
	sendSlashCommandWithArgs,
	waitForBotEmbed,
	waitForBotMessage,
} from '../fixtures/discord.fixture.js';
import {
	characterCreateForValue,
	cleanupModifiersByName,
	getE2ECharacter,
	getFullSheetRecord,
	waitForSheetRecord,
} from '../helpers/adjusted-sheet.js';

test.describe('/character sheet', () => {
	test('should display the active character sheet', async ({ discordChannel }) => {
		await sendSlashCommand(discordChannel, '/character sheet');

		const embed = await waitForBotEmbed(discordChannel);

		// The sheet embed should contain the character name in the title
		const title = embed.locator('[class*="embedTitle"]');
		await expect(title).toBeVisible();

		// Sheet embeds contain ability scores, HP, level, etc.
		// Verify the embed has field content (stats, abilities)
		await expect(embed.locator('[class*="embedField"]').first()).toBeVisible();
	});

	test('should display cached adjusted sheet values', async ({ discordChannel }) => {
		const character = await getE2ECharacter();
		const modifierName = `e2e sheet ac ${Date.now()}`.toLowerCase();
		const initial = await getFullSheetRecord(character.sheetRecordId);
		const baseAc = initial.sheet.intProperties.ac ?? 0;

		try {
			await sendSlashCommandWithArgs(discordChannel, '/modifier create', [
				{ name: 'name', value: modifierName },
				{ name: 'sheet-values', value: 'ac +2' },
				{
					name: 'create-for',
					value: characterCreateForValue(character),
					autocomplete: true,
				},
			]);
			const createMsg = await waitForBotMessage(discordChannel);
			expect((await createMsg.textContent())?.toLowerCase()).toContain('created');

			const adjusted = await waitForSheetRecord(
				character.sheetRecordId,
				record => record.adjustedSheet.intProperties.ac === baseAc + 2
			);
			expect(adjusted.sheet.intProperties.ac).toBe(baseAc);

			await sendSlashCommand(discordChannel, '/character sheet');
			const embedText = await (await waitForBotEmbed(discordChannel)).textContent();
			expect(embedText).toContain(String(baseAc + 2));
		} finally {
			await cleanupModifiersByName(modifierName);
		}
	});
});
