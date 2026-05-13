import _ from 'lodash';
import { describe, expect, it } from 'vitest';
import {
	ActionCostEnum,
	ActionTypeEnum,
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
	sheet.infoLists.immunities = immunities;
	sheet.weaknessesResistances.resistances = resistances;
	sheet.weaknessesResistances.weaknesses = weaknesses;
	sheet.baseCounters.hp.current = 100;
	sheet.baseCounters.hp.max = 100;
	return sheet;
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
		expect(result.appliedWeaknesses.map(weakness => weakness.type)).toEqual(['fire']);
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
		expect(result.appliedWeaknesses.map(weakness => weakness.type)).toEqual([
			'fire',
			'cold',
		]);
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
		expect(result.appliedResistances.map(resistance => resistance.type)).toEqual([
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
		expect(result.appliedImmunities).toEqual(['fire']);
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
		expect(result.appliedWeaknesses.map(weakness => weakness.type)).toEqual(['spell']);
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
			damageType: 'fire',
			healInsteadOfDamage: false,
			name: 'Fire',
			roll: null,
			type: RollTypeEnum.damage,
		};

		actionRoller.prepareDamage(damageRoll, 3);
		actionRoller.prepareDamage(damageRoll, 4);

		const preview = actionRoller.resolveDamage({ apply: false });

		expect(preview?.totalAfterIwr).toBe(12);
		expect(target.sheet.baseCounters.hp.current).toBe(100);

		actionRoller.resolveDamage({ apply: true });

		expect(actionRoller.totalDamageDealt).toBe(12);
		expect(actionRoller.triggeredWeaknesses.map(weakness => weakness.type)).toEqual(['fire']);
		expect(target.sheet.baseCounters.hp.current).toBe(88);
	});
});
