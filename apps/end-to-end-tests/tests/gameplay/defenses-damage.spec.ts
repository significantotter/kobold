import {
	ActionCostEnum,
	ActionTypeEnum,
	DefenseRule,
	DefenseRuleAutomation,
	DefenseRuleSource,
	RollTypeEnum,
	Sheet,
	SheetDefenses,
} from '@kobold/db';
import {
	test,
	expect,
	sendSlashCommandWithArgs,
	waitForBotEmbed,
	waitForBotMessage,
} from '../fixtures/discord.fixture.js';
import {
	E2E_CHARACTER_NAME,
	getE2ECharacter,
	getFullSheetRecord,
	waitForSheetRecord,
} from '../helpers/adjusted-sheet.js';
import { kobold } from '../db.js';
import { Config } from '@kobold/config';
import type { Page } from '@playwright/test';

const FULL_HP = 100;

function defenseRule({
	label,
	amount,
	match,
	appliesTo = ['damage'],
}: Pick<DefenseRule, 'label' | 'match'> &
	Partial<Pick<DefenseRule, 'amount' | 'appliesTo'>>): DefenseRule {
	return {
		label,
		raw: label,
		amount,
		appliesTo,
		match,
		automation: DefenseRuleAutomation.auto,
		source: DefenseRuleSource.manual,
	};
}

function emptyDefenses(): SheetDefenses {
	return { immunities: [], weaknesses: [], resistances: [] };
}

async function setDefenseTestSheet(defenses: SheetDefenses): Promise<{
	sheetRecordId: number;
	originalSheet: Sheet;
	originalAdjustedSheet: Sheet;
}> {
	const character = await getE2ECharacter();
	const record = await getFullSheetRecord(character.sheetRecordId);
	const sheet: Sheet = structuredClone(record.sheet);
	const adjustedSheet: Sheet = structuredClone(record.adjustedSheet);

	for (const target of [sheet, adjustedSheet]) {
		target.defenses = structuredClone(defenses);
		target.staticInfo.usesStamina = false;
		target.baseCounters.hp.current = FULL_HP;
		target.baseCounters.hp.max = FULL_HP;
		target.baseCounters.tempHp.current = 0;
		target.baseCounters.tempHp.max = null;
		target.baseCounters.stamina.current = 0;
		target.baseCounters.stamina.max = null;
	}

	await kobold.sheetRecord.update({ id: character.sheetRecordId }, { sheet, adjustedSheet });

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

async function expectHp(sheetRecordId: number, hp: number) {
	const record = await waitForSheetRecord(
		sheetRecordId,
		current =>
			current.sheet.baseCounters.hp.current === hp &&
			current.adjustedSheet.baseCounters.hp.current === hp
	);
	expect(record.sheet.baseCounters.hp.current).toBe(hp);
	expect(record.adjustedSheet.baseCounters.hp.current).toBe(hp);
}

async function applyGameplayDamage(discordChannel: any, amount: number, damageType: string) {
	await sendSlashCommandWithArgs(discordChannel, '/gameplay damage', [
		{ name: 'damage-amount', value: String(amount) },
		{ name: 'damage-type', value: damageType },
		{ name: 'target-character', value: E2E_CHARACTER_NAME, autocomplete: true },
	]);
	return (await waitForBotMessage(discordChannel)).textContent();
}

async function setCriticalImmunityAttackSheet(): Promise<{
	sheetRecordId: number;
	originalSheet: Sheet;
	originalAdjustedSheet: Sheet;
	attackName: string;
}> {
	const character = await getE2ECharacter();
	const record = await getFullSheetRecord(character.sheetRecordId);
	const sheet: Sheet = structuredClone(record.sheet);
	const adjustedSheet: Sheet = structuredClone(record.adjustedSheet);
	const attackName = `E2E Crit Test ${Date.now()}`;
	const critImmunity = defenseRule({
		label: 'critical hits',
		match: { traits: ['critical hits'] },
		appliesTo: ['critical-hit'],
	});

	for (const target of [sheet, adjustedSheet]) {
		target.staticInfo.usesStamina = false;
		target.intProperties.ac = 10;
		target.baseCounters.hp.current = FULL_HP;
		target.baseCounters.hp.max = FULL_HP;
		target.baseCounters.tempHp.current = 0;
		target.baseCounters.tempHp.max = null;
		target.baseCounters.stamina.current = 0;
		target.baseCounters.stamina.max = null;
		target.defenses = {
			immunities: [critImmunity],
			weaknesses: [],
			resistances: [],
		};
		target.attacks = [
			{
				name: attackName,
				toHit: 20,
				damage: [
					{ dice: '10', type: 'slashing', tags: [], mode: 'damage', persistent: false },
				],
				effects: [],
				range: null,
				traits: [],
				notes: null,
			},
		];
	}

	await kobold.sheetRecord.update({ id: character.sheetRecordId }, { sheet, adjustedSheet });

	return {
		sheetRecordId: character.sheetRecordId,
		originalSheet: record.sheet,
		originalAdjustedSheet: record.adjustedSheet,
		attackName,
	};
}

test.describe('defense damage resolution', () => {
	test('applies sheet.defenses through /gameplay damage', async ({ discordChannel }) => {
		const setup = await setDefenseTestSheet(emptyDefenses());

		try {
			await setDefenseTestSheet({
				...emptyDefenses(),
				resistances: [
					defenseRule({
						label: 'fire',
						amount: 5,
						match: { damageTypes: ['fire'] },
					}),
				],
			});
			const resistanceText = await applyGameplayDamage(discordChannel, 20, 'fire');
			expect(resistanceText).toContain('took 15 damage');
			expect(resistanceText).toContain('less damage from fire');
			await expectHp(setup.sheetRecordId, 85);

			await setDefenseTestSheet({
				...emptyDefenses(),
				weaknesses: [
					defenseRule({
						label: 'cold',
						amount: 7,
						match: { damageTypes: ['cold'] },
					}),
				],
			});
			const weaknessText = await applyGameplayDamage(discordChannel, 20, 'cold');
			expect(weaknessText).toContain('took 27 damage');
			expect(weaknessText).toContain('extra damage from cold');
			await expectHp(setup.sheetRecordId, 73);

			await setDefenseTestSheet({
				immunities: [
					defenseRule({
						label: 'electricity',
						match: { damageTypes: ['electricity'] },
					}),
				],
				resistances: [
					defenseRule({
						label: 'electricity',
						amount: 5,
						match: { damageTypes: ['electricity'] },
					}),
				],
				weaknesses: [
					defenseRule({
						label: 'electricity',
						amount: 5,
						match: { damageTypes: ['electricity'] },
					}),
				],
			});
			const immunityText = await applyGameplayDamage(discordChannel, 20, 'electricity');
			expect(immunityText).toContain('took 0 damage');
			expect(immunityText).toContain('no damage from electricity');
			expect(immunityText).not.toContain('extra damage from electricity');
			expect(immunityText).not.toContain('less damage from electricity');
			await expectHp(setup.sheetRecordId, FULL_HP);

			await setDefenseTestSheet({
				...emptyDefenses(),
				resistances: [
					defenseRule({
						label: 'all damage',
						amount: 5,
						match: { all: true },
					}),
				],
			});
			const allDamageText = await applyGameplayDamage(discordChannel, 7, 'slashing');
			expect(allDamageText).toContain('took 2 damage');
			expect(allDamageText).toContain('less damage from all damage');
			await expectHp(setup.sheetRecordId, 98);

			await setDefenseTestSheet({
				...emptyDefenses(),
				weaknesses: [
					defenseRule({
						label: 'plasma',
						amount: 5,
						match: { damageTypes: ['plasma'] },
					}),
				],
			});
			const contentDamageText = await applyGameplayDamage(discordChannel, 10, 'plasma');
			expect(contentDamageText).toContain('took 15 damage');
			expect(contentDamageText).toContain('extra damage from plasma');
			await expectHp(setup.sheetRecordId, 85);
		} finally {
			await restoreSheet(
				setup.sheetRecordId,
				setup.originalSheet,
				setup.originalAdjustedSheet
			);
		}
	});

	test('resolves all action damage terms as one damage instance', async ({ discordChannel }) => {
		const setup = await setDefenseTestSheet({
			immunities: [],
			resistances: [],
			weaknesses: [
				defenseRule({
					label: 'fire',
					amount: 5,
					match: { damageTypes: ['fire'] },
				}),
				defenseRule({
					label: 'cold',
					amount: 3,
					match: { damageTypes: ['cold'] },
				}),
				defenseRule({
					label: 'spell',
					amount: 4,
					match: { traits: ['spell'] },
				}),
			],
		});
		const actionName = `E2E Defense Burst ${Date.now()}`;
		let actionId: number | null = null;

		try {
			const action = await kobold.action.create({
				userId: Config.e2e?.userId ?? '',
				sheetRecordId: setup.sheetRecordId,
				name: actionName,
				description: 'E2E defense resolver coverage action',
				type: ActionTypeEnum.spell,
				actionCost: ActionCostEnum.oneAction,
				baseLevel: null,
				autoHeighten: false,
				tags: ['spell'],
				rolls: [
					{
						name: 'Elemental damage',
						type: RollTypeEnum.damage,
						allowRollModifiers: false,
						terms: [
							{
								dice: '3',
								type: 'fire',
								tags: [],
								mode: 'damage',
								persistent: false,
							},
							{
								dice: '4',
								type: 'fire',
								tags: [],
								mode: 'damage',
								persistent: false,
							},
							{
								dice: '2',
								type: 'cold',
								tags: [],
								mode: 'damage',
								persistent: false,
							},
						],
					},
				],
			});
			actionId = action.id;

			await sendSlashCommandWithArgs(discordChannel, '/roll action', [
				{ name: 'action', value: actionName, autocomplete: true },
				{ name: 'target-character', value: E2E_CHARACTER_NAME, autocomplete: true },
			]);

			const embedText = await (await waitForBotEmbed(discordChannel)).textContent();
			expect(embedText).toContain('took 21 damage');
			expect(embedText).toContain('extra damage');
			expect(embedText).toContain('fire');
			expect(embedText).toContain('cold');
			expect(embedText).toContain('spell');
			await expectHp(setup.sheetRecordId, 79);
		} finally {
			if (actionId != null) await kobold.action.delete({ id: actionId });
			await restoreSheet(
				setup.sheetRecordId,
				setup.originalSheet,
				setup.originalAdjustedSheet
			);
		}
	});

	test('critical hit immunity keeps forced /roll attack crit damage normal', async ({
		discordChannel,
	}) => {
		const setup = await setCriticalImmunityAttackSheet();

		try {
			await sendSlashCommandWithArgs(discordChannel, '/roll attack', [
				{ name: 'attack', value: setup.attackName, autocomplete: true },
				{ name: 'target-character', value: E2E_CHARACTER_NAME, autocomplete: true },
				{ name: 'overwrite-attack-roll', value: '20' },
			]);

			const embedText = await (await waitForBotEmbed(discordChannel as Page)).textContent();
			expect(embedText).toContain('Critical Hit! (immune)');
			expect(embedText).toContain('took 10 damage');
			expect(embedText).not.toContain('took 20 damage');
			await expectHp(setup.sheetRecordId, 90);
		} finally {
			await restoreSheet(
				setup.sheetRecordId,
				setup.originalSheet,
				setup.originalAdjustedSheet
			);
		}
	});
});
