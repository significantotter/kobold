import {
	test,
	expect,
	sendSlashCommandWithArgs,
	waitForBotEmbed,
	waitForBotMessage,
} from '../fixtures/discord.fixture.js';
import {
	E2E_CHARACTER_NAME,
	characterCreateForValue,
	cleanupModifiersByName,
	expectCurrentMirrored,
	getE2ECharacter,
	getFullSheetRecord,
	restoreHpCurrentToMax,
	waitForSheetRecord,
} from '../helpers/adjusted-sheet.js';

test.describe('current value mirroring', () => {
	test('HP-only writes update base and adjusted sheets without losing adjusted maximums', async ({
		discordChannel,
	}) => {
		const character = await getE2ECharacter();
		const modifierName = `e2e hp max ${Date.now()}`.toLowerCase();
		const initial = await getFullSheetRecord(character.sheetRecordId);
		const baseMaxHp = initial.sheet.baseCounters.hp.max ?? 0;

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

			await sendSlashCommandWithArgs(discordChannel, '/gameplay set', [
				{ name: 'set-option', value: 'hp', autocomplete: true },
				{ name: 'set-value', value: '7' },
				{ name: 'target-character', value: E2E_CHARACTER_NAME, autocomplete: true },
			]);
			const setMsg = await waitForBotMessage(discordChannel);
			expect((await setMsg.textContent())?.toLowerCase()).toContain('updated');

			await expectCurrentMirrored(character.sheetRecordId, 7);
			const mirrored = await getFullSheetRecord(character.sheetRecordId);
			expect(mirrored.sheet.baseCounters.hp.max).toBe(baseMaxHp);
			expect(mirrored.adjustedSheet.baseCounters.hp.max).toBe(baseMaxHp + 5);

			await sendSlashCommandWithArgs(discordChannel, '/character sheet', [
				{ name: 'sheet-style', value: 'counters_only' },
			]);
			const sheetText = await (await waitForBotEmbed(discordChannel)).textContent();
			expect(sheetText).toContain('7');
			expect(sheetText).toContain(String(baseMaxHp + 5));
		} finally {
			await cleanupModifiersByName(modifierName);
			await restoreHpCurrentToMax(character.sheetRecordId);
		}
	});
});
