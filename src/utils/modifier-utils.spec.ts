import {
	SheetAdjustmentTypeEnum,
	Attribute,
	Modifier,
	ModifierTypeEnum,
} from '../services/kobold/index.js';
import { ModifierUtils } from './modifier-utils.js';

describe('ModifierUtils', () => {
	describe('isModifierValidForTags', () => {
		test('parses a valid modifier based on target tags', () => {
			const result = ModifierUtils.isModifierValidForTags(
				{
					name: 'test',
					type: SheetAdjustmentTypeEnum.status,
					value: '2',
					targetTags: 'attack and (fire or bludgeoning)',
					isActive: false,
					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				[],
				['attack', 'bludgeoning']
			);
			expect(result).toBe(true);
		});
		test('parses an invalid modifier based on target tags', () => {
			const result = ModifierUtils.isModifierValidForTags(
				{
					name: 'test',
					type: SheetAdjustmentTypeEnum.status,
					value: '2',
					targetTags: 'attack and (fire or bludgeoning)',
					isActive: false,
					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				[],
				['attack', 'electricity']
			);
			expect(result).toBe(false);
		});
		test('certain keywords are usable for filtrex and not parsable as tags', () => {
			const result = ModifierUtils.isModifierValidForTags(
				{
					name: 'test',
					type: SheetAdjustmentTypeEnum.status,
					value: '2',
					targetTags:
						'attack and (fire or bludgeoning) or __foo not in (3, 6) or abs(max(__foo, 6)) == ceil(min(7, 4.6)) or floor(log(10)) < 5 or round(random()) == sqrt(4)',
					isActive: false,
					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				[
					{
						name: 'foo',
						aliases: ['foo'],
						type: SheetAdjustmentTypeEnum.circumstance,
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
				ModifierUtils.isModifierValidForTags(
					{
						name: 'test',
						type: SheetAdjustmentTypeEnum.status,
						value: '2',
						targetTags: '__foo = 5',
						isActive: false,
						description: null,
						modifierType: ModifierTypeEnum.roll,
					},
					[
						{
							name: 'foo',
							aliases: ['foo'],
							type: SheetAdjustmentTypeEnum.circumstance,
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
			let modifiers: Modifier[] = [
				{
					name: 'statusBonus',
					isActive: true,
					type: SheetAdjustmentTypeEnum.status,
					value: '2',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'statusBonus2',
					isActive: true,
					type: SheetAdjustmentTypeEnum.status,
					value: '1',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'statusBonus3',
					isActive: true,
					type: SheetAdjustmentTypeEnum.status,
					value: '-1',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'statusBonus4',
					isActive: true,
					type: SheetAdjustmentTypeEnum.status,
					value: '-2',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'untypedBonus',
					isActive: true,
					type: SheetAdjustmentTypeEnum.untyped,
					value: '2',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'untypedBonus2',
					isActive: true,
					type: SheetAdjustmentTypeEnum.untyped,
					value: '1',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'untypedBonus3',
					isActive: true,
					type: SheetAdjustmentTypeEnum.untyped,
					value: '-1',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'untypedBonus4',
					isActive: true,
					type: SheetAdjustmentTypeEnum.untyped,
					value: '-2',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'fooBonus',
					isActive: true,
					type: SheetAdjustmentTypeEnum.circumstance,
					value: '2',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'fooBonus2',
					isActive: true,
					type: SheetAdjustmentTypeEnum.circumstance,
					value: '1',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'fooBonus3',
					isActive: true,
					type: SheetAdjustmentTypeEnum.circumstance,
					value: '-1',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'foo bonus 4',
					isActive: true,
					type: SheetAdjustmentTypeEnum.circumstance,
					value: '-2',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'unmatchingBonus',
					isActive: true,
					type: SheetAdjustmentTypeEnum.circumstance,
					value: '3',
					targetTags: 'attack and (fire and bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'unmatchingPenalty',
					isActive: true,
					type: SheetAdjustmentTypeEnum.circumstance,
					value: '-3',
					targetTags: 'attack and (fire and bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'unmatchingUntyped',
					isActive: true,
					type: SheetAdjustmentTypeEnum.circumstance,
					value: '3',
					targetTags: 'attack and (fire and bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'not active',
					isActive: false,
					type: SheetAdjustmentTypeEnum.circumstance,
					value: '3',
					targetTags: 'attack and (fire and bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
			];
			let attributes: Attribute[] = [
				{
					name: 'foo',
					aliases: ['foo'],
					type: SheetAdjustmentTypeEnum.circumstance,
					value: 5,
					tags: ['foo'],
				},
			];
			let tags = ['attack', 'fire'];

			const { bonuses, penalties, untyped } = ModifierUtils.parseBonusesForTagsFromModifiers(
				modifiers,
				attributes,
				tags
			);

			expect(bonuses).toStrictEqual({
				foo: {
					name: 'fooBonus',
					isActive: true,
					type: SheetAdjustmentTypeEnum.circumstance,
					value: '2',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},

				status: {
					name: 'statusBonus',
					isActive: true,
					type: SheetAdjustmentTypeEnum.status,
					value: '2',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
			});
			expect(penalties).toStrictEqual({
				foo: {
					name: 'foo bonus 4',
					isActive: true,
					type: SheetAdjustmentTypeEnum.circumstance,
					value: '-2',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},

				status: {
					name: 'statusBonus4',
					isActive: true,
					type: SheetAdjustmentTypeEnum.status,
					value: '-2',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
			});
			expect(untyped).toStrictEqual([
				{
					name: 'untypedBonus',
					isActive: true,
					type: SheetAdjustmentTypeEnum.untyped,
					value: '2',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'untypedBonus2',
					isActive: true,
					type: SheetAdjustmentTypeEnum.untyped,
					value: '1',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'untypedBonus3',
					isActive: true,
					type: SheetAdjustmentTypeEnum.untyped,
					value: '-1',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'untypedBonus4',
					isActive: true,
					type: SheetAdjustmentTypeEnum.untyped,
					value: '-2',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
			]);
		});
		test('handles empty values', () => {
			const { bonuses, penalties, untyped } = ModifierUtils.parseBonusesForTagsFromModifiers(
				[],
				[],
				[]
			);
			expect(bonuses).toStrictEqual({});
			expect(penalties).toStrictEqual({});
			expect(untyped).toStrictEqual([]);
		});
	});
});
