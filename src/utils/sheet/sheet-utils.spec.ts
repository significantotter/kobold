import {
	Sheet,
	SheetAdjustmentTypeEnum,
	SheetAdjustmentOperationEnum,
	SheetAdjustment,
	AbilityEnum,
	AdjustablePropertyEnum,
	Modifier,
	SheetStatKeys,
} from '../../services/kobold/models/index.js';
import { KoboldError } from '../KoboldError.js';
import { SheetProperties } from './sheet-properties.js';
import { SheetUtils } from './sheet-utils.js';

function sheetWithTestProperties(): Sheet {
	const sheet = SheetProperties.defaultSheet;
	sheet.staticInfo.name = 'Test Sheet';
	sheet.intProperties.strength = 2;
	sheet.stats.fortitude = {
		proficiency: 2,
		bonus: 4,
		dc: 14,
		ability: AbilityEnum.constitution,
	};
	sheet.stats.reflex = {
		proficiency: 2,
		bonus: 6,
		dc: 16,
		ability: AbilityEnum.constitution,
	};
	return sheet;
}

describe('SheetUtils', () => {
	describe('adjustSheetWithModifiers', () => {
		it('should adjust the sheet with active sheet modifiers', () => {
			const sheet: Sheet = sheetWithTestProperties();
			const modifiers: Modifier[] = [
				{
					name: 'foo',
					description: '',
					modifierType: 'sheet',
					isActive: true,
					sheetAdjustments: [
						{
							type: SheetAdjustmentTypeEnum.untyped,
							propertyType: AdjustablePropertyEnum.intProperty,
							property: AbilityEnum.strength,
							operation: SheetAdjustmentOperationEnum['+'],
							value: '2',
						},
						{
							type: SheetAdjustmentTypeEnum.untyped,
							propertyType: AdjustablePropertyEnum.stat,
							property: SheetStatKeys.fortitude,
							operation: SheetAdjustmentOperationEnum['+'],
							value: '3',
						},
					],
				},
				{
					name: 'foo',
					description: '',
					modifierType: 'sheet',
					isActive: false,
					sheetAdjustments: [
						{
							type: SheetAdjustmentTypeEnum.untyped,
							propertyType: AdjustablePropertyEnum.stat,
							property: SheetStatKeys.reflex,
							operation: SheetAdjustmentOperationEnum['+'],
							value: '3',
						},
					],
				},
				{
					name: 'bar',
					description: '',
					modifierType: 'roll',
					isActive: true,
					type: 'status',
					value: '1d4',
					targetTags: 'attack',
				},
			];
			const adjustedSheet = SheetUtils.adjustSheetWithModifiers(sheet, modifiers);
			expect(adjustedSheet.intProperties.strength).toEqual(4);
			expect(adjustedSheet.stats.fortitude.bonus).toEqual(7);
			expect(adjustedSheet.stats.reflex.bonus).toEqual(6);
		});

		it('should not adjust the sheet with inactive sheet modifiers', () => {
			const sheet: Sheet = sheetWithTestProperties();
			const modifiers: Modifier[] = [
				{
					name: 'foo',
					description: '',
					modifierType: 'sheet',
					isActive: false,
					sheetAdjustments: [
						{
							type: SheetAdjustmentTypeEnum.untyped,
							propertyType: AdjustablePropertyEnum.intProperty,
							property: AbilityEnum.strength,
							operation: SheetAdjustmentOperationEnum['+'],
							value: '1',
						},
					],
				},
				{
					name: 'bar',
					description: '',
					modifierType: 'roll',
					isActive: true,
					type: 'status',
					value: '1d4',
					targetTags: 'attack',
				},
			];
			const adjustedSheet = SheetUtils.adjustSheetWithModifiers(sheet, modifiers);
			expect(adjustedSheet.intProperties.strength).toEqual(2);
		});
	});

	describe('stringToSheetAdjustments', () => {
		it('should convert a string to sheet adjustments', () => {
			const input = 'Strength + 2; Dex - 1';
			const sheet: Sheet = sheetWithTestProperties();
			const adjustments: SheetAdjustment[] = [
				{
					type: SheetAdjustmentTypeEnum.untyped,
					propertyType: AdjustablePropertyEnum.intProperty,
					property: AbilityEnum.strength,
					operation: SheetAdjustmentOperationEnum['+'],
					value: '2',
				},
				{
					type: SheetAdjustmentTypeEnum.untyped,
					propertyType: AdjustablePropertyEnum.intProperty,
					property: AbilityEnum.dexterity,
					operation: SheetAdjustmentOperationEnum['-'],
					value: '1',
				},
			];
			expect(SheetUtils.stringToSheetAdjustments(input, sheet)).toEqual(adjustments);
		});

		it('should throw an error for an invalid adjustment', () => {
			const input = 'Strength + foo';
			const sheet: Sheet = sheetWithTestProperties();
			expect(() => SheetUtils.stringToSheetAdjustments(input, sheet)).toThrow(KoboldError);
		});
	});

	describe('adjustSheetWithSheetAdjustments', () => {
		it('should adjust the sheet with sheet adjustments', () => {
			const sheet: Sheet = sheetWithTestProperties();
			const sheetAdjustments: SheetAdjustment[] = [
				{
					type: SheetAdjustmentTypeEnum.untyped,
					propertyType: AdjustablePropertyEnum.intProperty,
					property: 'Strength',
					operation: SheetAdjustmentOperationEnum['+'],
					value: '2',
				},
			];
			const adjustedSheet = SheetUtils.adjustSheetWithSheetAdjustments(
				sheet,
				sheetAdjustments
			);
			expect(adjustedSheet.intProperties.strength).toEqual(4);
		});

		it('should adjust the sheet with grouped sheet adjustments', () => {
			const sheet: Sheet = sheetWithTestProperties();
			sheet.stats.thievery.dc = 12;
			sheet.stats.thievery.bonus = 2;
			const sheetAdjustments: SheetAdjustment[] = [
				{
					type: SheetAdjustmentTypeEnum.untyped,
					propertyType: AdjustablePropertyEnum.none,
					property: 'dex skill dcs',
					operation: SheetAdjustmentOperationEnum['+'],
					value: '2',
				},
			];
			const adjustedSheet = SheetUtils.adjustSheetWithSheetAdjustments(
				sheet,
				sheetAdjustments
			);
			//the dcs were null, so they are now default dc (10) +2
			expect(adjustedSheet.stats.acrobatics.dc).toEqual(12);
			expect(adjustedSheet.stats.acrobatics.bonus).toBeNull();
			expect(adjustedSheet.stats.stealth.dc).toEqual(12);
			expect(adjustedSheet.stats.stealth.bonus).toBeNull();
			// except thievery which we gave a bonus of 2 and a value of 12
			expect(adjustedSheet.stats.thievery.dc).toEqual(14);
			expect(adjustedSheet.stats.thievery.bonus).toEqual(2);

			// other stat dcs/bonuses are still unchanged
			expect(adjustedSheet.stats.arcana.dc).toBeNull();
			expect(adjustedSheet.stats.reflex.dc).toEqual(16);
			expect(adjustedSheet.stats.perception.dc).toBeNull();
			expect(adjustedSheet.stats.reflex.bonus).toEqual(6);
			expect(adjustedSheet.stats.reflex.proficiency).toEqual(2);
		});

		it('allows a user to add an attack to a sheet', () => {
			const sheet: Sheet = sheetWithTestProperties();
			const newAttack = SheetUtils.stringToSheetAdjustments(
				'Claw attack = to hit +2 | damage 1d4 + 1 acid or piercing | traits: agile, finesse, unarmed | notes: "foo"',
				sheet
			);
			const adjustedSheet = SheetUtils.adjustSheetWithSheetAdjustments(sheet, newAttack);
			expect(adjustedSheet.attacks.length).toEqual(1);
			expect(adjustedSheet.attacks[0].name).toEqual('Claw');
			expect(adjustedSheet.attacks[0].toHit).toEqual(2);
			expect(adjustedSheet.attacks[0].traits).toEqual(['agile', 'finesse', 'unarmed']);
			expect(adjustedSheet.attacks[0].notes).toEqual('"foo"');
			expect(adjustedSheet.attacks[0].damage[0].dice).toEqual('1d4 + 1');
			expect(adjustedSheet.attacks[0].damage[0].type).toEqual('acid or piercing');
		});

		it('should throw an error for an invalid adjustment', () => {
			const sheet: Sheet = sheetWithTestProperties();
			const sheetAdjustments: SheetAdjustment[] = [
				{
					type: SheetAdjustmentTypeEnum.untyped,
					propertyType: AdjustablePropertyEnum.intProperty,
					property: 'Strength',
					operation: SheetAdjustmentOperationEnum['+'],
					value: 'foo',
				},
			];
			expect(() =>
				SheetUtils.adjustSheetWithSheetAdjustments(sheet, sheetAdjustments)
			).toThrow(KoboldError);
		});
	});
});
