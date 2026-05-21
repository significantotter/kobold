import { describe, expect, it, vi } from 'vitest';

import { AbilityEnum, SheetAdjustmentTypeEnum, type Kobold } from '@kobold/db';
import { SheetProperties } from '@kobold/sheet';
import { DiceUtils } from './dice-utils.js';
import { DefaultUtils } from './default-utils.js';
import { RollContextService, RollEngine } from './roll-engine.js';

function createAttributeQueryMock(row: Record<string, string>) {
	const chain: Record<string, any> = {};
	for (const method of ['selectFrom', 'select', 'where']) {
		chain[method] = vi.fn(() => chain);
	}
	chain.executeTakeFirst = vi.fn(async () => row);
	return chain;
}

describe('RollEngine', () => {
	it('detects bracket references consistently across repeated calls', () => {
		expect(RollEngine.isPureDiceExpression('1d20+[str]')).toBe(false);
		expect(RollEngine.isPureDiceExpression('1d20+[str]')).toBe(false);
		expect(RollEngine.isPureDiceExpression('1d20')).toBe(true);
		expect(RollEngine.isPureDiceExpression('1d20+[smokeToHit]')).toBe(false);
	});

	it('fetches requested adjusted sheet attributes from stable JSON aliases', async () => {
		const query = createAttributeQueryMock({
			rollattr0: '14',
			rollattr1: '4',
			rollattr2: '4',
			rollattr3: '2',
			rollattr4: '4',
			rollattr5: '2',
			rollattr6: '-1',
		});
		const kobold = {
			db: { selectFrom: query.selectFrom },
			sheetRecord: { readAdjusted: vi.fn() },
		} as unknown as Kobold;
		const service = new RollContextService(kobold);

		const attributes = await service.getAttributes({
			sheetRecordId: 1,
			attributeRefs: ['str', 'dex', 'con', 'int', 'wis', 'cha'],
		});

		expect(attributes.map(attr => [attr.name, attr.value])).toEqual(
			expect.arrayContaining([
				['strength', 4],
				['dexterity', 4],
				['constitution', 2],
				['intelligence', 4],
				['wisdom', 2],
				['charisma', -1],
				['trained', 16],
			])
		);
		expect(kobold.sheetRecord.readAdjusted).not.toHaveBeenCalled();
	});

	it('includes level-derived proficiency attributes for lean roll parsing', async () => {
		const query = createAttributeQueryMock({
			rollattr0: '10',
			rollattr1: '5',
		});
		const kobold = {
			db: { selectFrom: query.selectFrom },
			sheetRecord: { readAdjusted: vi.fn() },
		} as unknown as Kobold;
		const service = new RollContextService(kobold);

		const attributes = await service.getAttributes({
			sheetRecordId: 1,
			attributeRefs: ['dex'],
		});
		const [expression] = DiceUtils.parseAttributes(
			'1d20+[dex]+[trained]+[expert]',
			undefined,
			attributes
		);

		expect(expression).toBe('1d20+5+12+14');
		expect(kobold.sheetRecord.readAdjusted).not.toHaveBeenCalled();
	});

	it('fetches stat bonuses without falling back to the full sheet', async () => {
		const query = createAttributeQueryMock({
			rollattr0: '14',
			rollattr1: '18',
		});
		const kobold = {
			db: { selectFrom: query.selectFrom },
			sheetRecord: { readAdjusted: vi.fn() },
		} as unknown as Kobold;
		const service = new RollContextService(kobold);

		const attributes = await service.getAttributes({
			sheetRecordId: 1,
			attributeRefs: ['perceptionBonus'],
		});

		expect(attributes.map(attr => [attr.name, attr.value])).toEqual(
			expect.arrayContaining([
				['perceptionBonus', 18],
				['trained', 16],
			])
		);
		expect(kobold.sheetRecord.readAdjusted).not.toHaveBeenCalled();
	});

	it('resolves lore attributes in custom rolls through the full-sheet fallback', async () => {
		const sheet = JSON.parse(JSON.stringify(SheetProperties.defaultSheet));
		sheet.additionalSkills = [
			{
				name: 'Esoteric Lore',
				bonus: 11,
				dc: 21,
				proficiency: 4,
				ability: AbilityEnum.charisma,
				note: null,
			},
		];
		const kobold = {
			sheetRecord: { readAdjusted: vi.fn(async () => ({ sheet })) },
		} as unknown as Kobold;
		const service = new RollContextService(kobold);

		const attributes = await service.getAttributes({
			sheetRecordId: 1,
			attributeRefs: [
				'Esoteric Lore',
				'Esoteric_Lore_Bonus',
				'esotericLoreDc',
				'esoteric lore prof',
			],
		});
		const [expression, tags] = DiceUtils.parseAttributes(
			'1d20+[Esoteric Lore]+[Esoteric_Lore_Bonus]+[esotericLoreDc]+[esoteric lore prof]',
			undefined,
			attributes
		);

		expect(expression).toBe('1d20+11+11+21+4');
		expect(tags).toEqual(
			expect.arrayContaining(['skill', 'charisma', 'esoteric lore', 'lore'])
		);
		expect(kobold.sheetRecord.readAdjusted).toHaveBeenCalledOnce();
	});

	it('applies lore-targeted modifiers to custom rolls using lore attributes', async () => {
		const sheet = JSON.parse(JSON.stringify(SheetProperties.defaultSheet));
		sheet.additionalSkills = [
			{
				name: 'Esoteric Lore',
				bonus: 11,
				dc: 21,
				proficiency: 4,
				ability: AbilityEnum.charisma,
				note: null,
			},
		];
		const kobold = {
			sheetRecord: { readAdjusted: vi.fn(async () => ({ sheet })) },
		} as unknown as Kobold;
		const service = new RollContextService(kobold);

		const { total } = await RollEngine.rollWithContext({
			context: {
				subject: { character: { name: 'Miro', sheetRecordId: 1 } as any },
				userSettings: DefaultUtils.userSettings,
				rollMacros: [],
				rollModifiers: [
					{
						isActive: true,
						name: 'Lore Aura',
						rollAdjustment: '+2',
						rollTargetTags: 'lore',
						severity: null,
						type: SheetAdjustmentTypeEnum.untyped,
						sheetAdjustments: [],
					},
				],
			},
			attributeContextService: service,
			options: {
				rollExpression: '1d1+[Esoteric_Lore]',
				rollTitle: '',
				actorName: 'Miro',
				rollDescription: 'rolled dice',
			},
		});

		expect(total).toBe(14);
	});

	it('keeps custom skill names instead of coercing them to standard PF2e skills', () => {
		expect(RollEngine.getStructuredRollName('esoteric lore', 'skill')).toBe('esoteric lore');
		expect(RollEngine.getStructuredRollName('computers', 'skill')).toBe('computers');
		expect(RollEngine.getStructuredRollName('piloting', 'skill')).toBe('piloting');
	});

	it('still normalizes exact, prefix, and near-typo structured roll names', () => {
		expect(RollEngine.getStructuredRollName('Stealth', 'skill')).toBe('stealth');
		expect(RollEngine.getStructuredRollName('medcine', 'skill')).toBe('medicine');
		expect(RollEngine.getStructuredRollName('fort', 'save')).toBe('fortitude');
	});
});

describe('DiceUtils.parseAttributes', () => {
	it('resolves every bracket token in a multi-attribute expression', () => {
		const [expression] = DiceUtils.parseAttributes(
			'[str] + [dex] + [con] + [int] + [wis] + [cha]',
			undefined,
			[
				{ name: 'strength', aliases: ['str'], type: 'attr', value: 4, tags: ['strength'] },
				{
					name: 'dexterity',
					aliases: ['dex'],
					type: 'attr',
					value: 4,
					tags: ['dexterity'],
				},
				{
					name: 'constitution',
					aliases: ['con'],
					type: 'attr',
					value: 2,
					tags: ['constitution'],
				},
				{
					name: 'intelligence',
					aliases: ['int'],
					type: 'attr',
					value: 4,
					tags: ['intelligence'],
				},
				{ name: 'wisdom', aliases: ['wis'], type: 'attr', value: 2, tags: ['wisdom'] },
				{ name: 'charisma', aliases: ['cha'], type: 'attr', value: -1, tags: ['charisma'] },
			]
		);

		expect(expression).toBe('4 + 4 + 2 + 4 + 2 + (-1)');
	});
});
