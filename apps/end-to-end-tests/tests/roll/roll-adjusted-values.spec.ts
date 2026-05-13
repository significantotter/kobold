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
	signed,
	waitForSheetRecord,
} from '../helpers/adjusted-sheet.js';

test.describe('adjusted sheet roll commands', () => {
	test('skill, save, and perception rolls use cached adjusted stats', async ({
		discordChannel,
	}) => {
		const character = await getE2ECharacter();
		const modifierName = `e2e adjusted rolls ${Date.now()}`.toLowerCase();
		const initial = await getFullSheetRecord(character.sheetRecordId);
		const baseStealth = initial.sheet.stats.stealth.bonus ?? 0;
		const baseFortitude = initial.sheet.stats.fortitude.bonus ?? 0;
		const basePerception = initial.sheet.stats.perception.bonus ?? 0;

		try {
			await sendSlashCommandWithArgs(discordChannel, '/modifier create', [
				{ name: 'name', value: modifierName },
				{
					name: 'sheet-values',
					value: 'stealthBonus +10; fortitudeBonus +7; perceptionBonus +6',
				},
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
				record =>
					record.adjustedSheet.stats.stealth.bonus === baseStealth + 10 &&
					record.adjustedSheet.stats.fortitude.bonus === baseFortitude + 7 &&
					record.adjustedSheet.stats.perception.bonus === basePerception + 6
			);
			expect(adjusted.sheet.stats.stealth.bonus).toBe(baseStealth);
			expect(adjusted.sheet.stats.fortitude.bonus).toBe(baseFortitude);
			expect(adjusted.sheet.stats.perception.bonus).toBe(basePerception);

			await sendSlashCommandWithArgs(discordChannel, '/roll skill', [
				{ name: 'skill', value: 'stealth', autocomplete: true },
			]);
			const skillText = await (await waitForBotEmbed(discordChannel)).textContent();
			expect(skillText?.toLowerCase()).toContain('stealth');
			expect(skillText).toContain(signed(baseStealth + 10));

			await sendSlashCommandWithArgs(discordChannel, '/roll save', [
				{ name: 'save', value: 'Fortitude', autocomplete: true },
			]);
			const saveText = await (await waitForBotEmbed(discordChannel)).textContent();
			expect(saveText?.toLowerCase()).toContain('fortitude');
			expect(saveText).toContain(signed(baseFortitude + 7));

			await sendSlashCommand(discordChannel, '/roll perception');
			const perceptionText = await (await waitForBotEmbed(discordChannel)).textContent();
			expect(perceptionText?.toLowerCase()).toContain('perception');
			expect(perceptionText).toContain(signed(basePerception + 6));
		} finally {
			await cleanupModifiersByName(modifierName);
		}
	});
});
