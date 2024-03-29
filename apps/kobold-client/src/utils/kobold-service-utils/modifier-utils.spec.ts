import {
	AbilityEnum,
	AdjustablePropertyEnum,
	Attribute,
	Modifier,
	SheetAdjustmentOperationEnum,
	SheetAdjustmentTypeEnum,
} from 'kobold-db';
import { ModifierUtils } from './modifier-utils.js';

describe('ModifierUtils', () => {
	describe('applyRollModifierSeverity', () => {
		it('should replace sheet modifier severity placeholder with actual severity value', () => {
			const modifier: Modifier = {
				name: 'foo',
				description: '',
				isActive: true,
				severity: 2,
				type: SheetAdjustmentTypeEnum.untyped,
				sheetAdjustments: [
					{
						type: SheetAdjustmentTypeEnum.untyped,
						propertyType: AdjustablePropertyEnum.intProperty,
						property: AbilityEnum.strength,
						operation: SheetAdjustmentOperationEnum['+'],
						value: ' [severity ]',
					},
				],
				rollAdjustment: null,
				rollTargetTags: null,
			};

			const expectedModifier: Modifier = {
				...modifier,
				sheetAdjustments: [
					{
						...modifier.sheetAdjustments[0],
						value: ' 2',
					},
				],
			};

			const result = ModifierUtils.getSeverityAppliedModifier(modifier);
			expect(result).toEqual(expectedModifier);
		});
		it('should replace roll modifier severity placeholder with actual severity value', () => {
			const modifier: Modifier = {
				name: 'test',
				type: SheetAdjustmentTypeEnum.status,
				severity: 3,
				rollAdjustment: '1+[ severity]',
				rollTargetTags: 'attack and (fire or bludgeoning)',
				sheetAdjustments: [],
				isActive: false,
				description: null,
			};

			const expectedModifier: Modifier = {
				...modifier,
				rollAdjustment: '1+3',
			};

			const result = ModifierUtils.getSeverityAppliedModifier(modifier);
			expect(result).toEqual(expectedModifier);
		});
	});
	describe('isModifierValidForTags', () => {
		test('parses a valid modifier based on target tags', () => {
			const result = ModifierUtils.isModifierValidForTags(
				{
					name: 'test',
					type: SheetAdjustmentTypeEnum.status,
					rollAdjustment: '[severity]',
					rollTargetTags: 'attack and (fire or bludgeoning)',
					sheetAdjustments: [],
					severity: 2,
					isActive: false,
					description: null,
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
					rollAdjustment: '2',
					severity: null,
					rollTargetTags: 'attack and (fire or bludgeoning)',
					sheetAdjustments: [],
					isActive: false,
					description: null,
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
					rollAdjustment: '2',
					rollTargetTags:
						'attack and (fire or bludgeoning) or __foo not in (3, 6) or abs(max(__foo, 6)) == ceil(min(7, 4.6)) or floor(log(10)) < 5 or round(random()) == sqrt(4)',
					sheetAdjustments: [],
					isActive: false,
					severity: null,
					description: null,
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
		test('characters not usable by filtrex or in attributes return false', () => {
			const valid = ModifierUtils.isModifierValidForTags(
				{
					name: 'test',
					type: SheetAdjustmentTypeEnum.status,
					rollAdjustment: '2',
					rollTargetTags: '__foo = 5',
					sheetAdjustments: [],
					isActive: false,
					severity: null,
					description: null,
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

			expect(valid).toBe(false);
		});
	});

	describe('parseBonusesForTagsFromModifiers', () => {
		test('properly parses bonuses, penalties, and untyped modifiers', () => {
			let modifiers: Modifier[] = [
				{
					name: 'statusBonus',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.status,
					rollAdjustment: '2',
					rollTargetTags: 'attack and (fire or bludgeoning)',

					sheetAdjustments: [],
					description: null,
				},
				{
					name: 'statusBonus2',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.status,
					rollAdjustment: '1',
					rollTargetTags: 'attack and (fire or bludgeoning)',

					sheetAdjustments: [],
					description: null,
				},
				{
					name: 'statusBonus3',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.status,
					rollAdjustment: '-1',
					rollTargetTags: 'attack and (fire or bludgeoning)',

					sheetAdjustments: [],
					description: null,
				},
				{
					name: 'statusBonus4',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.status,
					rollAdjustment: '-2',
					rollTargetTags: 'attack and (fire or bludgeoning)',

					sheetAdjustments: [],
					description: null,
				},
				{
					name: 'untypedBonus',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.untyped,
					rollAdjustment: '2',
					rollTargetTags: 'attack and (fire or bludgeoning)',

					sheetAdjustments: [],
					description: null,
				},
				{
					name: 'untypedBonus2',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.untyped,
					rollAdjustment: '1',
					rollTargetTags: 'attack and (fire or bludgeoning)',

					sheetAdjustments: [],
					description: null,
				},
				{
					name: 'untypedBonus3',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.untyped,
					rollAdjustment: '-1',
					rollTargetTags: 'attack and (fire or bludgeoning)',

					sheetAdjustments: [],
					description: null,
				},
				{
					name: 'untypedBonus4',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.untyped,
					rollAdjustment: '-2',
					rollTargetTags: 'attack and (fire or bludgeoning)',

					sheetAdjustments: [],
					description: null,
				},
				{
					name: 'fooBonus',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.circumstance,
					rollAdjustment: '2',
					rollTargetTags: 'attack and (fire or bludgeoning)',

					sheetAdjustments: [],
					description: null,
				},
				{
					name: 'fooBonus2',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.circumstance,
					rollAdjustment: '1',
					rollTargetTags: 'attack and (fire or bludgeoning)',

					sheetAdjustments: [],
					description: null,
				},
				{
					name: 'fooBonus3',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.circumstance,
					rollAdjustment: '-1',
					rollTargetTags: 'attack and (fire or bludgeoning)',

					sheetAdjustments: [],
					description: null,
				},
				{
					name: 'foo bonus 4',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.circumstance,
					rollAdjustment: '-2',
					rollTargetTags: 'attack and (fire or bludgeoning)',

					sheetAdjustments: [],
					description: null,
				},
				{
					name: 'unmatchingBonus',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.circumstance,
					rollAdjustment: '3',
					rollTargetTags: 'attack and (fire and bludgeoning)',

					sheetAdjustments: [],
					description: null,
				},
				{
					name: 'unmatchingPenalty',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.circumstance,
					rollAdjustment: '-3',
					rollTargetTags: 'attack and (fire and bludgeoning)',

					sheetAdjustments: [],
					description: null,
				},
				{
					name: 'unmatchingUntyped',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.circumstance,
					rollAdjustment: '3',
					rollTargetTags: 'attack and (fire and bludgeoning)',

					sheetAdjustments: [],
					description: null,
				},
				{
					name: 'not active',
					isActive: false,
					severity: null,
					type: SheetAdjustmentTypeEnum.circumstance,
					rollAdjustment: '3',
					rollTargetTags: 'attack and (fire and bludgeoning)',

					sheetAdjustments: [],
					description: null,
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
				circumstance: {
					name: 'fooBonus',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.circumstance,
					value: '2',
					rollTargetTags: 'attack and (fire or bludgeoning)',

					description: null,
				},

				status: {
					name: 'statusBonus',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.status,
					value: '2',
					rollTargetTags: 'attack and (fire or bludgeoning)',

					description: null,
				},
			});
			expect(penalties).toStrictEqual({
				circumstance: {
					name: 'foo bonus 4',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.circumstance,
					value: '-2',
					rollTargetTags: 'attack and (fire or bludgeoning)',

					description: null,
				},

				status: {
					name: 'statusBonus4',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.status,
					value: '-2',
					rollTargetTags: 'attack and (fire or bludgeoning)',

					description: null,
				},
			});
			expect(untyped).toStrictEqual([
				{
					name: 'untypedBonus',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.untyped,
					value: '2',
					rollTargetTags: 'attack and (fire or bludgeoning)',

					description: null,
				},
				{
					name: 'untypedBonus2',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.untyped,
					value: '1',
					rollTargetTags: 'attack and (fire or bludgeoning)',

					description: null,
				},
				{
					name: 'untypedBonus3',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.untyped,
					value: '-1',
					rollTargetTags: 'attack and (fire or bludgeoning)',

					description: null,
				},
				{
					name: 'untypedBonus4',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.untyped,
					value: '-2',
					rollTargetTags: 'attack and (fire or bludgeoning)',

					description: null,
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
