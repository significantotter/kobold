import { describe, expect, it, vi } from 'vitest';

import type { Kobold } from '@kobold/db';
import { DiceUtils } from './dice-utils.js';
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
});

describe('DiceUtils.parseAttributes', () => {
	it('resolves every bracket token in a multi-attribute expression', () => {
		const [expression] = DiceUtils.parseAttributes(
			'[str] + [dex] + [con] + [int] + [wis] + [cha]',
			undefined,
			[
				{ name: 'strength', aliases: ['str'], type: 'attr', value: 4, tags: ['strength'] },
				{ name: 'dexterity', aliases: ['dex'], type: 'attr', value: 4, tags: ['dexterity'] },
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
