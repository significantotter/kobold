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
	cleanupE2EInitiatives,
	cleanupModifiersByName,
	getE2ECharacter,
	getFullSheetRecord,
	waitForSheetRecord,
} from '../helpers/adjusted-sheet.js';

test.describe('initiative adjusted sheet display', () => {
	test('show uses cached adjusted actor sheets', async ({ discordChannel }) => {
		const character = await getE2ECharacter();
		const modifierName = `e2e init hp ${Date.now()}`.toLowerCase();
		const initial = await getFullSheetRecord(character.sheetRecordId);
		const baseMaxHp = initial.sheet.baseCounters.hp.max ?? 0;

		await cleanupE2EInitiatives();

		try {
			await sendSlashCommandWithArgs(discordChannel, '/modifier create', [
				{ name: 'name', value: modifierName },
				{ name: 'sheet-values', value: 'maxHp +5' },
				{
					name: 'create-for',
					value: characterCreateForValue(character),
					autocomplete: true,
				},
			]);
			const createMsg = await waitForBotMessage(discordChannel);
			expect((await createMsg.textContent())?.toLowerCase()).toContain('created');

			await waitForSheetRecord(
				character.sheetRecordId,
				record => record.adjustedSheet.baseCounters.hp.max === baseMaxHp + 5
			);

			await sendSlashCommand(discordChannel, '/init start');
			await expect(await waitForBotEmbed(discordChannel)).toBeVisible();

			await sendSlashCommand(discordChannel, '/init join');
			await expect(await waitForBotMessage(discordChannel)).toBeVisible();

			await sendSlashCommand(discordChannel, '/init show');
			const showText = await (await waitForBotEmbed(discordChannel)).textContent();
			expect(showText).toContain('E2E Test Character');
			expect(showText).toContain(String(baseMaxHp + 5));
		} finally {
			await cleanupModifiersByName(modifierName);
			await cleanupE2EInitiatives();
		}
	});
});
