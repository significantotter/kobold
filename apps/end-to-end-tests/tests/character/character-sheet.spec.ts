import {
	DefenseRuleAutomation,
	DefenseRuleSource,
	type DefenseRule,
	type Sheet,
	type SheetDefenses,
} from '@kobold/db';
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
import { kobold } from '../db.js';

function defenseRule({
	label,
	amount,
	match,
	appliesTo = ['damage'],
	automation = DefenseRuleAutomation.auto,
}: Pick<DefenseRule, 'label' | 'match'> &
	Partial<Pick<DefenseRule, 'amount' | 'appliesTo' | 'automation'>>): DefenseRule {
	return {
		label,
		raw: label,
		amount,
		appliesTo,
		match,
		automation,
		source: DefenseRuleSource.manual,
	};
}

async function setSheetDisplayDefenses(defenses: SheetDefenses): Promise<{
	sheetRecordId: number;
	originalSheet: Sheet;
	originalAdjustedSheet: Sheet;
}> {
	const character = await getE2ECharacter();
	const record = await getFullSheetRecord(character.sheetRecordId);
	const sheet: Sheet = structuredClone(record.sheet);
	const adjustedSheet: Sheet = structuredClone(record.adjustedSheet);

	sheet.defenses = structuredClone(defenses);
	adjustedSheet.defenses = structuredClone(defenses);

	await kobold.sheetRecord.update(
		{ id: character.sheetRecordId },
		{ sheet, adjustedSheet }
	);

	await waitForSheetRecord(
		character.sheetRecordId,
		current =>
			current.sheet.defenses.resistances.length === defenses.resistances.length &&
			current.sheet.defenses.weaknesses.length === defenses.weaknesses.length &&
			current.sheet.defenses.immunities.length === defenses.immunities.length &&
			current.adjustedSheet.defenses.resistances.length === defenses.resistances.length &&
			current.adjustedSheet.defenses.weaknesses.length === defenses.weaknesses.length &&
			current.adjustedSheet.defenses.immunities.length === defenses.immunities.length
	);

	return {
		sheetRecordId: character.sheetRecordId,
		originalSheet: record.sheet,
		originalAdjustedSheet: record.adjustedSheet,
	};
}

async function restoreSheet(
	sheetRecordId: number,
	originalSheet: Sheet,
	originalAdjustedSheet: Sheet
) {
	await kobold.sheetRecord.update(
		{ id: sheetRecordId },
		{ sheet: originalSheet, adjustedSheet: originalAdjustedSheet }
	);
}

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

	test('should display structured defenses across matcher and effect paths', async ({
		discordChannel,
	}) => {
		const defenses: SheetDefenses = {
			resistances: [
				defenseRule({
					label: 'all damage',
					amount: 5,
					match: { all: true },
				}),
				defenseRule({
					label: 'physical',
					amount: 3,
					match: { damageGroups: ['physical'] },
				}),
				defenseRule({
					label: 'fire',
					amount: 7,
					match: { damageTypes: ['fire'] },
				}),
				defenseRule({
					label: 'cold iron',
					amount: 10,
					match: { materials: ['cold iron'] },
				}),
				defenseRule({
					label: 'area damage',
					amount: 4,
					match: { traits: ['area'] },
				}),
				defenseRule({
					label: 'physical except silver',
					amount: 9,
					match: {
						damageGroups: ['physical'],
						except: { materials: ['silver'] },
					},
				}),
			],
			weaknesses: [
				defenseRule({
					label: 'plasma',
					amount: 6,
					match: { damageTypes: ['plasma'] },
				}),
				defenseRule({
					label: 'silver',
					amount: 2,
					match: { materials: ['silver'] },
				}),
				defenseRule({
					label: 'spell damage',
					amount: 4,
					match: { traits: ['spell'] },
				}),
				defenseRule({
					label: 'fear effects',
					amount: 8,
					match: { effectTypes: ['fear'] },
					appliesTo: ['effect'],
				}),
				defenseRule({
					label: 'vampire weaknesses',
					match: { traits: ['vampire weaknesses'] },
					automation: DefenseRuleAutomation.manual,
				}),
			],
			immunities: [
				defenseRule({
					label: 'fire',
					match: { damageTypes: ['fire'] },
				}),
				defenseRule({
					label: 'paralyzed',
					match: { conditions: ['paralyzed'] },
					appliesTo: ['condition'],
				}),
				defenseRule({
					label: 'poison',
					match: { effectTypes: ['poison'] },
					appliesTo: ['effect'],
				}),
				defenseRule({
					label: 'critical hits',
					match: { traits: ['critical hits'] },
					appliesTo: ['critical-hit'],
				}),
				defenseRule({
					label: 'nonlethal attacks',
					match: { traits: ['nonlethal'] },
					appliesTo: ['nonlethal'],
				}),
			],
		};
		const setup = await setSheetDisplayDefenses(defenses);

		try {
			await sendSlashCommand(discordChannel, '/character sheet');
			const embedText = (await (await waitForBotEmbed(discordChannel)).textContent()) ?? '';

			expect(embedText).toContain('Resistances:');
			for (const text of [
				'all damage 5',
				'physical 3',
				'fire 7',
				'cold iron 10',
				'area damage 4',
				'physical except silver 9',
			]) {
				expect(embedText).toContain(text);
			}

			expect(embedText).toContain('Weaknesses:');
			for (const text of [
				'plasma 6',
				'silver 2',
				'spell damage 4',
				'fear effects 8',
				'vampire weaknesses',
			]) {
				expect(embedText).toContain(text);
			}

			expect(embedText).toContain('Immunities:');
			for (const text of [
				'fire',
				'paralyzed',
				'poison',
				'critical hits',
				'nonlethal attacks',
			]) {
				expect(embedText).toContain(text);
			}
		} finally {
			await restoreSheet(setup.sheetRecordId, setup.originalSheet, setup.originalAdjustedSheet);
		}
	});
});
