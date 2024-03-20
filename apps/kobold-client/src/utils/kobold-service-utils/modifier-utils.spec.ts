import {
	AbilityEnum,
	AdjustablePropertyEnum,
	Attribute,
	Modifier,
	ModifierTypeEnum,
	RollModifier,
	SheetAdjustmentOperationEnum,
	SheetAdjustmentTypeEnum,
	SheetModifier,
} from 'kobold-db';
import { ModifierUtils } from './modifier-utils.js';

describe('ModifierUtils', () => {
	describe('applySheetModifierSeverity', () => {
		it('should replace sheet modifier severity placeholder with actual severity value', () => {
			const modifier: SheetModifier = {
				name: 'foo',
				description: '',
				modifierType: ModifierTypeEnum.sheet,
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
			};

			const expectedModifier: SheetModifier = {
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
			const modifier: RollModifier = {
				name: 'test',
				type: SheetAdjustmentTypeEnum.status,
				value: '1+[ severity]',
				severity: 3,
				targetTags: 'attack and (fire or bludgeoning)',
				isActive: false,
				description: null,
				modifierType: ModifierTypeEnum.roll,
			};

			const expectedModifier: RollModifier = {
				...modifier,
				value: '1+3',
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
					value: '[severity]',
					severity: 2,
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
					severity: null,
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
					severity: null,
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
		test('characters not usable by filtrex or in attributes return false', () => {
			const valid = ModifierUtils.isModifierValidForTags(
				{
					name: 'test',
					type: SheetAdjustmentTypeEnum.status,
					value: '2',
					targetTags: '__foo = 5',
					isActive: false,
					severity: null,
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
					value: '2',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'statusBonus2',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.status,
					value: '1',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'statusBonus3',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.status,
					value: '-1',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'statusBonus4',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.status,
					value: '-2',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'untypedBonus',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.untyped,
					value: '2',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'untypedBonus2',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.untyped,
					value: '1',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'untypedBonus3',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.untyped,
					value: '-1',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'untypedBonus4',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.untyped,
					value: '-2',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'fooBonus',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.circumstance,
					value: '2',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'fooBonus2',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.circumstance,
					value: '1',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'fooBonus3',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.circumstance,
					value: '-1',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'foo bonus 4',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.circumstance,
					value: '-2',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'unmatchingBonus',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.circumstance,
					value: '3',
					targetTags: 'attack and (fire and bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'unmatchingPenalty',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.circumstance,
					value: '-3',
					targetTags: 'attack and (fire and bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'unmatchingUntyped',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.circumstance,
					value: '3',
					targetTags: 'attack and (fire and bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'not active',
					isActive: false,
					severity: null,
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
				circumstance: {
					name: 'fooBonus',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.circumstance,
					value: '2',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},

				status: {
					name: 'statusBonus',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.status,
					value: '2',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
			});
			expect(penalties).toStrictEqual({
				circumstance: {
					name: 'foo bonus 4',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.circumstance,
					value: '-2',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},

				status: {
					name: 'statusBonus4',
					isActive: true,
					severity: null,
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
					severity: null,
					type: SheetAdjustmentTypeEnum.untyped,
					value: '2',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'untypedBonus2',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.untyped,
					value: '1',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'untypedBonus3',
					isActive: true,
					severity: null,
					type: SheetAdjustmentTypeEnum.untyped,
					value: '-1',
					targetTags: 'attack and (fire or bludgeoning)',

					description: null,
					modifierType: ModifierTypeEnum.roll,
				},
				{
					name: 'untypedBonus4',
					isActive: true,
					severity: null,
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
