import {
	test,
	expect,
	sendSlashCommandWithArgs,
	waitForBotMessage,
} from '../fixtures/discord.fixture.js';
import {
	E2E_CHARACTER_NAME,
	cleanupConditionsByName,
	getE2ECharacter,
	getFullSheetRecord,
	waitForSheetRecord,
} from '../helpers/adjusted-sheet.js';

test.describe('condition adjusted sheet recompute', () => {
	test('applying a sheet-adjusting condition recomputes adjusted_sheet only', async ({
		discordChannel,
	}) => {
		const character = await getE2ECharacter();
		const conditionName = `e2eac${Date.now() % 100000}`.toLowerCase();
		const initial = await getFullSheetRecord(character.sheetRecordId);
		const baseAc = initial.sheet.intProperties.ac ?? 0;

		try {
			await sendSlashCommandWithArgs(discordChannel, '/condition apply-custom', [
				{ name: 'target-character', value: E2E_CHARACTER_NAME, autocomplete: true },
				{ name: 'name', value: conditionName },
				{ name: 'sheet-values', value: 'ac +1' },
			]);

			const createMsg = await waitForBotMessage(discordChannel);
			expect((await createMsg.textContent())?.toLowerCase()).toContain('applied');

			const adjusted = await waitForSheetRecord(
				character.sheetRecordId,
				record =>
					record.conditions.some(condition => condition.name === conditionName) &&
					record.adjustedSheet.intProperties.ac === baseAc + 1
			);
			expect(adjusted.sheet.intProperties.ac).toBe(baseAc);
		} finally {
			await cleanupConditionsByName(conditionName);
		}
	});
});
