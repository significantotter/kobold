import { isModifierValidForTags, parseBonusesForTagsFromModifiers } from './helpers.js';

describe('isModifierValidForTags', () => {
	test('parses a valid modifier based on target tags', () => {
		const result = isModifierValidForTags(
			{
				name: 'test',
				type: 'status',
				value: '2',
				targetTags: 'attack and (fire or bludgeoning)',
			},
			[],
			['attack', 'bludgeoning']
		);
		expect(result).toBe(true);
	});
	test('parses an invalid modifier based on target tags', () => {
		const result = isModifierValidForTags(
			{
				name: 'test',
				type: 'status',
				value: '2',
				targetTags: 'attack and (fire or bludgeoning)',
			},
			[],
			['attack', 'electricity']
		);
		expect(result).toBe(false);
	});
	test('certain keywords are usable for filtrex and not parsable as tags', () => {
		const result = isModifierValidForTags(
			{
				name: 'test',
				type: 'status',
				value: '2',
				targetTags:
					'attack and (fire or bludgeoning) or __foo not in (3, 6) or abs(max(__foo, 6)) == ceil(min(7, 4.6)) or floor(log(10)) < 5 or round(random()) == sqrt(4)',
			},
			[
				{
					name: 'foo',
					type: 'foo',
					value: 5,
					tags: ['foo'],
				},
			],
			['attack', 'electricity']
		);
		expect(result).toBe(true);
	});
	test('characters not usable by filtrex or in attributes throw an error', () => {
		expect(() =>
			isModifierValidForTags(
				{
					name: 'test',
					type: 'status',
					value: '2',
					targetTags: '__foo = 5',
				},
				[
					{
						name: 'foo',
						type: 'foo',
						value: 5,
						tags: ['foo'],
					},
				],
				['attack', 'electricity']
			)
		).toThrow();
	});
});

describe('parseBonusesForTagsFromModifiers', () => {
	test('properly parses bonuses, penalties, and untyped modifiers', () => {
		let modifiers = [
			{
				name: 'statusBonus',
				isActive: true,
				type: 'status',
				value: '2',
				targetTags: 'attack and (fire or bludgeoning)',
			},
			{
				name: 'statusBonus2',
				isActive: true,
				type: 'status',
				value: '1',
				targetTags: 'attack and (fire or bludgeoning)',
			},
			{
				name: 'statusBonus3',
				isActive: true,
				type: 'status',
				value: '-1',
				targetTags: 'attack and (fire or bludgeoning)',
			},
			{
				name: 'statusBonus4',
				isActive: true,
				type: 'status',
				value: '-2',
				targetTags: 'attack and (fire or bludgeoning)',
			},
			{
				name: 'untypedBonus',
				isActive: true,
				type: 'untyped',
				value: '2',
				targetTags: 'attack and (fire or bludgeoning)',
			},
			{
				name: 'untypedBonus2',
				isActive: true,
				type: 'untyped',
				value: '1',
				targetTags: 'attack and (fire or bludgeoning)',
			},
			{
				name: 'untypedBonus3',
				isActive: true,
				type: 'untyped',
				value: '-1',
				targetTags: 'attack and (fire or bludgeoning)',
			},
			{
				name: 'untypedBonus4',
				isActive: true,
				type: 'untyped',
				value: '-2',
				targetTags: 'attack and (fire or bludgeoning)',
			},
			{
				name: 'fooBonus',
				isActive: true,
				type: 'foo',
				value: '2',
				targetTags: 'attack and (fire or bludgeoning)',
			},
			{
				name: 'fooBonus2',
				isActive: true,
				type: 'foo',
				value: '1',
				targetTags: 'attack and (fire or bludgeoning)',
			},
			{
				name: 'fooBonus3',
				isActive: true,
				type: 'foo',
				value: '-1',
				targetTags: 'attack and (fire or bludgeoning)',
			},
			{
				name: 'foo bonus 4',
				isActive: true,
				type: 'foo',
				value: '-2',
				targetTags: 'attack and (fire or bludgeoning)',
			},
			{
				name: 'unmatchingBonus',
				isActive: true,
				type: 'foo',
				value: '3',
				targetTags: 'attack and (fire and bludgeoning)',
			},
			{
				name: 'unmatchingPenalty',
				isActive: true,
				type: 'foo',
				value: '-3',
				targetTags: 'attack and (fire and bludgeoning)',
			},
			{
				name: 'unmatchingUntyped',
				isActive: true,
				type: 'foo',
				value: '3',
				targetTags: 'attack and (fire and bludgeoning)',
			},
			{
				name: 'not active',
				isActive: false,
				type: 'foo',
				value: '3',
				targetTags: 'attack and (fire and bludgeoning)',
			},
		];
		let attributes = [
			{
				name: 'foo',
				type: 'foo',
				value: 5,
				tags: ['foo'],
			},
		];
		let tags = ['attack', 'fire'];

		const { bonuses, penalties, untyped } = parseBonusesForTagsFromModifiers(
			modifiers,
			attributes,
			tags
		);

		expect(bonuses).toStrictEqual({
			foo: {
				name: 'fooBonus',
				isActive: true,
				type: 'foo',
				value: '2',
				targetTags: 'attack and (fire or bludgeoning)',
			},

			status: {
				name: 'statusBonus',
				isActive: true,
				type: 'status',
				value: '2',
				targetTags: 'attack and (fire or bludgeoning)',
			},
		});
		expect(penalties).toStrictEqual({
			foo: {
				name: 'foo bonus 4',
				isActive: true,
				type: 'foo',
				value: '-2',
				targetTags: 'attack and (fire or bludgeoning)',
			},

			status: {
				name: 'statusBonus4',
				isActive: true,
				type: 'status',
				value: '-2',
				targetTags: 'attack and (fire or bludgeoning)',
			},
		});
		expect(untyped).toStrictEqual([
			{
				name: 'untypedBonus',
				isActive: true,
				type: 'untyped',
				value: '2',
				targetTags: 'attack and (fire or bludgeoning)',
			},
			{
				name: 'untypedBonus2',
				isActive: true,
				type: 'untyped',
				value: '1',
				targetTags: 'attack and (fire or bludgeoning)',
			},
			{
				name: 'untypedBonus3',
				isActive: true,
				type: 'untyped',
				value: '-1',
				targetTags: 'attack and (fire or bludgeoning)',
			},
			{
				name: 'untypedBonus4',
				isActive: true,
				type: 'untyped',
				value: '-2',
				targetTags: 'attack and (fire or bludgeoning)',
			},
		]);
	});
	test('handles empty values', () => {
		const { bonuses, penalties, untyped } = parseBonusesForTagsFromModifiers([], [], []);
		expect(bonuses).toStrictEqual({});
		expect(penalties).toStrictEqual({});
		expect(untyped).toStrictEqual([]);
	});
});
