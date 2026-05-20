import _ from 'lodash';
import { describe, expect, it } from 'vitest';
import {
	ActionCostEnum,
	ActionTypeEnum,
	DefenseRule,
	DefenseRuleAutomation,
	DefenseRuleSource,
	RollTypeEnum,
	type Action,
	type DamageRoll,
	type Sheet,
} from '@kobold/db';
import { SheetProperties } from '@kobold/sheet';
import { resolveDamagePacket } from './damage-resolver.js';
import { Creature } from './creature.js';
import { ActionRoller } from './action-roller.js';

function sheetWithIwr({
	immunities = [],
	resistances = [],
	weaknesses = [],
}: {
	immunities?: string[];
	resistances?: { type: string; amount: number }[];
	weaknesses?: { type: string; amount: number }[];
}): Sheet {
	const sheet = _.cloneDeep(SheetProperties.defaultSheet);
	const rule = (type: string, amount?: number): DefenseRule => ({
		label: type,
		raw: type,
		amount,
		appliesTo: ['damage'],
		match:
			type === 'all damage'
				? { all: true }
				: type === 'physical'
					? { damageGroups: ['physical'] }
					: ['cold iron', 'silver', 'adamantine'].includes(type)
						? { materials: [type] }
						: { damageTypes: [type], traits: [type] },
		automation: DefenseRuleAutomation.auto,
		source: DefenseRuleSource.manual,
	});
	sheet.defenses.immunities = immunities.map(immunity => rule(immunity));
	sheet.defenses.resistances = resistances.map(resistance =>
		rule(resistance.type, resistance.amount)
	);
	sheet.defenses.weaknesses = weaknesses.map(weakness => rule(weakness.type, weakness.amount));
	sheet.baseCounters.hp.current = 100;
	sheet.baseCounters.hp.max = 100;
	return sheet;
}

function addCriticalHitImmunity(sheet: Sheet) {
	sheet.defenses.immunities.push({
		label: 'critical hits',
		raw: 'critical hits',
		appliesTo: ['critical-hit'],
		match: { traits: ['critical hits'] },
		automation: DefenseRuleAutomation.auto,
		source: DefenseRuleSource.manual,
	});
}

describe('resolveDamagePacket', () => {
	it('combines damage of the same type before applying a weakness once', () => {
		const sheet = sheetWithIwr({
			weaknesses: [{ type: 'fire', amount: 5 }],
		});

		const result = resolveDamagePacket(sheet, {
			lines: [
				{ amount: 3, damageType: 'fire' },
				{ amount: 4, damageType: 'fire' },
			],
		});

		expect(result.totalBeforeIwr).toBe(7);
		expect(result.totalAfterIwr).toBe(12);
		expect(result.appliedWeaknesses.map(weakness => weakness.label)).toEqual(['fire']);
	});

	it('can trigger multiple different weaknesses once in a single effect', () => {
		const sheet = sheetWithIwr({
			weaknesses: [
				{ type: 'fire', amount: 5 },
				{ type: 'cold', amount: 3 },
			],
		});

		const result = resolveDamagePacket(sheet, {
			lines: [
				{ amount: 4, damageType: 'fire' },
				{ amount: 4, damageType: 'cold' },
			],
		});

		expect(result.totalAfterIwr).toBe(16);
		expect(result.appliedWeaknesses.map(weakness => weakness.label)).toEqual(['fire', 'cold']);
	});

	it('uses only the highest matching resistance for a damage type and source', () => {
		const sheet = sheetWithIwr({
			resistances: [
				{ type: 'cold iron', amount: 10 },
				{ type: 'piercing', amount: 5 },
			],
		});

		const result = resolveDamagePacket(sheet, {
			tags: ['cold iron'],
			lines: [{ amount: 20, damageType: 'piercing' }],
		});

		expect(result.totalAfterIwr).toBe(10);
		expect(result.appliedResistances.map(resistance => resistance.label)).toEqual([
			'cold iron',
		]);
	});

	it('applies resistance to all damage separately to each damage type', () => {
		const sheet = sheetWithIwr({
			resistances: [{ type: 'all damage', amount: 5 }],
		});

		const result = resolveDamagePacket(sheet, {
			lines: [
				{ amount: 7, damageType: 'slashing' },
				{ amount: 4, damageType: 'fire' },
			],
		});

		expect(result.totalAfterIwr).toBe(2);
		expect(result.byType.map(bucket => bucket.amountAfterIwr)).toEqual([2, 0]);
	});

	it('applies immunity before weakness and resistance', () => {
		const sheet = sheetWithIwr({
			immunities: ['fire'],
			resistances: [{ type: 'fire', amount: 5 }],
			weaknesses: [{ type: 'fire', amount: 5 }],
		});

		const result = resolveDamagePacket(sheet, {
			lines: [{ amount: 10, damageType: 'fire' }],
		});

		expect(result.totalAfterIwr).toBe(0);
		expect(result.appliedImmunities.map(immunity => immunity.label)).toEqual(['fire']);
		expect(result.appliedWeaknesses).toEqual([]);
		expect(result.appliedResistances).toEqual([]);
	});

	it('can match action tags and only trigger that weakness once', () => {
		const sheet = sheetWithIwr({
			weaknesses: [{ type: 'spell', amount: 4 }],
		});

		const result = resolveDamagePacket(sheet, {
			tags: ['spell'],
			lines: [
				{ amount: 6, damageType: 'fire' },
				{ amount: 6, damageType: 'cold' },
			],
		});

		expect(result.totalAfterIwr).toBe(16);
		expect(result.appliedWeaknesses.map(weakness => weakness.label)).toEqual(['spell']);
	});

	it('preserves the old Creature.applyDamage behavior as a one-line packet', () => {
		const creature = new Creature({
			sheet: sheetWithIwr({
				weaknesses: [{ type: 'fire', amount: 5 }],
				resistances: [{ type: 'fire', amount: 3 }],
			}),
			actions: [],
			rollMacros: [],
			modifiers: [],
			conditions: [],
		});

		const result = creature.applyDamage(10, 'fire');

		expect(result.totalDamage).toBe(12);
		expect(result.appliedDamage).toBe(12);
		expect(creature.sheet.baseCounters.hp.current).toBe(88);
	});

	it('lets ActionRoller prepare damage and resolve it later', () => {
		const source = new Creature({
			sheet: sheetWithIwr({}),
			actions: [],
			rollMacros: [],
			modifiers: [],
			conditions: [],
		});
		const target = new Creature({
			sheet: sheetWithIwr({
				weaknesses: [{ type: 'fire', amount: 5 }],
			}),
			actions: [],
			rollMacros: [],
			modifiers: [],
			conditions: [],
		});
		const action: Action = {
			actionCost: ActionCostEnum.oneAction,
			autoHeighten: false,
			baseLevel: null,
			description: '',
			id: -1,
			name: 'Burn Twice',
			rolls: [],
			sheetRecordId: null,
			tags: ['spell'],
			type: ActionTypeEnum.spell,
			userId: '-1',
		};
		const actionRoller = new ActionRoller(null, action, source, target, {
			autoApplyDamage: false,
		});
		const damageRoll: DamageRoll = {
			allowRollModifiers: false,
			name: 'Fire',
			type: RollTypeEnum.damage,
			terms: [
				{
					dice: null,
					type: 'fire',
					tags: [],
					mode: 'damage',
					persistent: false,
				},
			],
		};

		actionRoller.prepareDamage(damageRoll, 3, [], 'fire');
		actionRoller.prepareDamage(damageRoll, 4, [], 'fire');

		const preview = actionRoller.resolveDamage({ apply: false });

		expect(preview?.totalAfterIwr).toBe(12);
		expect(target.sheet.baseCounters.hp.current).toBe(100);

		actionRoller.resolveDamage({ apply: true });

		expect(actionRoller.totalDamageDealt).toBe(12);
		expect(actionRoller.triggeredWeaknesses.map(weakness => weakness.label)).toEqual(['fire']);
		expect(target.sheet.baseCounters.hp.current).toBe(88);
	});

	it('resolves advanced damage as success damage against critical-hit immunity while keeping critical text', () => {
		const source = new Creature({
			sheet: sheetWithIwr({}),
			actions: [],
			rollMacros: [],
			modifiers: [],
			conditions: [],
		});
		const targetSheet = sheetWithIwr({});
		addCriticalHitImmunity(targetSheet);
		const target = new Creature({
			sheet: targetSheet,
			actions: [],
			rollMacros: [],
			modifiers: [],
			conditions: [],
		});
		const action: Action = {
			actionCost: ActionCostEnum.oneAction,
			autoHeighten: false,
			baseLevel: null,
			description: '',
			id: -1,
			name: 'Crit Immune Strike',
			rolls: [
				{
					allowRollModifiers: false,
					name: 'To Hit',
					roll: '30',
					targetDC: 'AC',
					type: RollTypeEnum.attack,
				},
				{
					allowRollModifiers: false,
					criticalFailureTerms: [],
					criticalSuccessTerms: [
						{
							dice: '40',
							type: 'slashing',
							tags: [],
							mode: 'damage',
							persistent: false,
						},
					],
					failureTerms: [],
					name: 'Advanced damage',
					successTerms: [
						{
							dice: '10',
							type: 'slashing',
							tags: [],
							mode: 'damage',
							persistent: false,
						},
					],
					type: RollTypeEnum.AdvancedDamage,
				},
				{
					allowRollModifiers: false,
					criticalFailureText: null,
					criticalSuccessText: 'critical rider still applies',
					defaultText: null,
					extraTags: [],
					failureText: null,
					name: 'Effects',
					successText: null,
					type: RollTypeEnum.text,
				},
			],
			sheetRecordId: null,
			tags: [],
			type: ActionTypeEnum.attack,
			userId: '-1',
		};

		const actionRoller = new ActionRoller(null, action, source, target);
		const rollBuilder = actionRoller.buildRoll('', '', { targetDC: 20 });

		expect(actionRoller.totalDamageDealt).toBe(10);
		expect(actionRoller.preparedDamageLines[0]).toMatchObject({
			actualOutcome: 'critical success',
			damageOutcome: 'success',
			outcomeAdjustedBy: [
				expect.objectContaining({
					label: 'critical hits',
				}),
			],
		});
		expect(target.sheet.baseCounters.hp.current).toBe(90);
		expect(
			rollBuilder.rollResults.some(
				result =>
					result.type === 'text' &&
					result.name === 'Effects' &&
					result.value.includes('Critical Success: critical rider still applies')
			)
		).toBe(true);
	});
});
