import { describe, expect, it } from 'vitest';
import { RollTypeEnum, SheetAttack } from '@kobold/db';
import { readFileSync } from 'node:fs';
import { convertPathBuilderToSheet, buildTwoHandRollMacrosForAttacks } from '@kobold/sheet';
import { buildImportedAttackAction } from './imported-attack-action-builder.js';

const renFixtureUrl = new URL(
	'../../../../apps/end-to-end-tests/tests/fixtures/data/ren.sheet.json',
	import.meta.url
);

function attack(overrides: Partial<SheetAttack> = {}): SheetAttack {
	return {
		name: 'Longsword',
		toHit: 10,
		damage: [
			{
				dice: '1d8+4',
				type: 'slashing',
				tags: ['slashing'],
				mode: 'damage',
				persistent: false,
			},
		],
		effects: [],
		range: null,
		traits: [],
		notes: null,
		...overrides,
	};
}

describe('buildImportedAttackAction', () => {
	it('builds the existing plain attack roll structure', () => {
		const action = buildImportedAttackAction({ attack: attack() });

		expect(action.rolls).toEqual([
			{
				type: RollTypeEnum.attack,
				name: 'To Hit',
				roll: 'd20+10',
				targetDC: 'AC',
				allowRollModifiers: true,
			},
			{
				type: RollTypeEnum.damage,
				name: 'Weapon Damage',
				terms: [
					{
						dice: '1d8+4',
						type: 'slashing',
						tags: ['slashing'],
						mode: 'damage',
						persistent: false,
					},
				],
				allowRollModifiers: true,
			},
		]);
	});

	it('uses advanced damage for deadly critical damage', () => {
		const action = buildImportedAttackAction({
			attack: attack({ traits: ['deadly d10'] }),
		});

		expect(action.rolls[1]).toMatchObject({
			type: RollTypeEnum.AdvancedDamage,
			name: 'Weapon Damage',
			successTerms: [expect.objectContaining({ dice: '1d8+4' })],
			criticalSuccessTerms: [
				expect.objectContaining({ dice: '(1d8+4)*2' }),
				expect.objectContaining({ dice: '1d10', source: 'deadly', label: 'Deadly' }),
			],
		});
	});

	it('uses advanced damage for fatal critical damage', () => {
		const action = buildImportedAttackAction({
			attack: attack({ traits: ['fatal 1d12'] }),
		});

		expect(action.rolls[1]).toMatchObject({
			type: RollTypeEnum.AdvancedDamage,
			name: 'Weapon Damage',
			successTerms: [expect.objectContaining({ dice: '1d8+4' })],
			criticalSuccessTerms: [
				expect.objectContaining({ dice: '(1d12+4)*2' }),
				expect.objectContaining({ dice: '1d12', source: 'fatal', label: 'Fatal' }),
			],
		});
	});

	it('pairs each imported damage effect with its own critical damage', () => {
		const action = buildImportedAttackAction({
			attack: attack({
				traits: ['deadly d8'],
				damage: [
					{
						dice: '3d6+4',
						type: 'P',
						tags: [],
						mode: 'damage',
						persistent: false,
					},
					{
						dice: '1d6',
						type: 'Fire',
						tags: [],
						mode: 'damage',
						persistent: false,
					},
					{
						dice: '1d6',
						type: 'Electricity',
						tags: [],
						mode: 'damage',
						persistent: false,
					},
				],
			}),
		});

		expect(action.rolls.slice(1)).toMatchObject([
			{
				type: RollTypeEnum.AdvancedDamage,
				name: 'Weapon Damage',
				allowRollModifiers: true,
				successTerms: [expect.objectContaining({ dice: '3d6+4', type: 'P' })],
				criticalSuccessTerms: [
					expect.objectContaining({ dice: '(3d6+4)*2', type: 'P' }),
					expect.objectContaining({
						dice: '2d8',
						type: 'P',
						source: 'deadly',
						label: 'Deadly',
					}),
				],
			},
			{
				type: RollTypeEnum.AdvancedDamage,
				name: 'Fire Damage',
				allowRollModifiers: false,
				successTerms: [expect.objectContaining({ dice: '1d6', type: 'Fire' })],
				criticalSuccessTerms: [
					expect.objectContaining({ dice: '(1d6)*2', type: 'Fire' }),
				],
			},
			{
				type: RollTypeEnum.AdvancedDamage,
				name: 'Electricity Damage',
				allowRollModifiers: false,
				successTerms: [expect.objectContaining({ dice: '1d6', type: 'Electricity' })],
				criticalSuccessTerms: [
					expect.objectContaining({ dice: '(1d6)*2', type: 'Electricity' }),
				],
			},
		]);
	});

	it('uses imported source labels for damage roll names', () => {
		const action = buildImportedAttackAction({
			attack: attack({
				traits: ['deadly d8'],
				damage: [
					{
						dice: '3d6+4',
						type: 'P',
						tags: [],
						mode: 'damage',
						persistent: false,
					},
					{
						dice: '1d6',
						type: 'Fire',
						tags: [],
						label: 'Flaming Rune',
						source: 'Flaming Rune',
						mode: 'damage',
						persistent: false,
					},
					{
						dice: '1d6',
						type: 'Electricity',
						tags: [],
						label: 'Shock Rune',
						source: 'Shock Rune',
						mode: 'damage',
						persistent: false,
					},
				],
			}),
		});

		expect(action.rolls.slice(1).map(roll => roll.name)).toEqual([
			'Weapon Damage',
			'Flaming Rune Damage',
			'Shock Rune Damage',
		]);
	});

	it('deduplicates repeated source-based damage roll names', () => {
		const action = buildImportedAttackAction({
			attack: attack({
				traits: ['deadly d8'],
				damage: [
					{
						dice: '1d6',
						type: 'P',
						tags: [],
						mode: 'damage',
						persistent: false,
					},
					{
						dice: '1d6',
						type: 'Fire',
						tags: [],
						label: 'Flaming Rune',
						source: 'Flaming Rune',
						mode: 'damage',
						persistent: false,
					},
					{
						dice: '1d6',
						type: 'Fire',
						tags: [],
						label: 'Flaming Rune',
						source: 'Flaming Rune',
						mode: 'damage',
						persistent: false,
					},
				],
			}),
		});

		expect(action.rolls.slice(1).map(roll => roll.name)).toEqual([
			'Weapon Damage',
			'Flaming Rune Damage',
			'Flaming Rune Damage 2',
		]);
	});

	it('does not change the action structure for two-hand', () => {
		const action = buildImportedAttackAction({
			attack: attack({ traits: ['two-hand 1d10'] }),
		});

		expect(action.rolls).toHaveLength(2);
		expect(action.rolls[1]).toMatchObject({
			type: RollTypeEnum.damage,
			name: 'Weapon Damage',
			terms: [expect.objectContaining({ dice: '1d8+4' })],
		});
	});

	it('parses Ren fixture Katana and Leiomano imports with striking-aware deadly metrics', () => {
		const renFixture = JSON.parse(readFileSync(renFixtureUrl, 'utf8'));
		const sheet = convertPathBuilderToSheet(renFixture.sourceData, {
			useStamina: false,
			nethysCompendiumEntries: [
				{
					name: 'Katana',
					item_category: 'Weapons',
					item_subcategory: 'Base Weapons',
					trait_raw: ['Uncommon', 'Deadly d8', 'Two-Hand 1d10', 'Versatile P'],
				},
				{
					name: 'Leiomano',
					item_category: 'Weapons',
					item_subcategory: 'Base Weapons',
					trait_raw: ['Uncommon', 'Deadly d10', 'Versatile S'],
				},
				{
					name: 'Silver (High-Grade)',
					item_category: 'Materials',
				},
			],
		});
		const katana = sheet.attacks.find(importedAttack => importedAttack.name === 'Katana');
		const leiomano = sheet.attacks.find(importedAttack => importedAttack.name === 'Leiomano');

		expect(katana).toMatchObject({
			damage: [expect.objectContaining({ dice: '2d6+ 5', type: 'S' })],
			traits: expect.arrayContaining(['Deadly d8', 'Two-Hand 1d10']),
		});
		expect(leiomano).toMatchObject({
			damage: [expect.objectContaining({ dice: '4d6+ 5', type: 'B' })],
			traits: expect.arrayContaining(['Deadly d10']),
		});

		const katanaAction = buildImportedAttackAction({ attack: katana! });
		const leiomanoAction = buildImportedAttackAction({ attack: leiomano! });

		expect(katanaAction.rolls[1]).toMatchObject({
			type: RollTypeEnum.AdvancedDamage,
			name: 'Weapon Damage',
			successTerms: [expect.objectContaining({ dice: '2d6+ 5' })],
			criticalSuccessTerms: [
				expect.objectContaining({ dice: '(2d6+ 5)*2' }),
				expect.objectContaining({ dice: '1d8', source: 'deadly', label: 'Deadly' }),
			],
		});
		expect(leiomanoAction.rolls[1]).toMatchObject({
			type: RollTypeEnum.AdvancedDamage,
			name: 'Weapon Damage',
			successTerms: [expect.objectContaining({ dice: '4d6+ 5' })],
			criticalSuccessTerms: [
				expect.objectContaining({ dice: '(4d6+ 5)*2' }),
				expect.objectContaining({ dice: '3d10', source: 'deadly', label: 'Deadly' }),
			],
		});
		expect(buildTwoHandRollMacrosForAttacks(sheet.attacks)).toContainEqual({
			name: 'katana-two-hand',
			macro: '2d10+ 5',
		});
	});
});
