import {
	Sheet,
	SheetAdjustmentTypeEnum,
	SheetAdjustmentOperationEnum,
	SheetAdjustment,
	AbilityEnum,
	AdjustablePropertyEnum,
	Modifier,
	SheetStatKeys,
	ModifierTypeEnum,
} from '../../services/kobold/index.js';
import { KoboldError } from '../KoboldError.js';
import { SheetProperties } from './sheet-properties.js';
import { SheetUtils } from './sheet-utils.js';

function sheetWithTestProperties(): Sheet {
	const sheet = SheetProperties.defaultSheet;
	sheet.staticInfo.name = 'Test Sheet';
	sheet.intProperties.strength = 2;
	sheet.stats.fortitude = {
		name: 'Fortitude',
		proficiency: 2,
		bonus: 4,
		dc: 14,
		ability: AbilityEnum.constitution,
		note: null,
	};
	sheet.stats.reflex = {
		name: 'Reflex',
		proficiency: 2,
		bonus: 6,
		dc: 16,
		ability: AbilityEnum.constitution,
		note: null,
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
					modifierType: ModifierTypeEnum.sheet,
					isActive: true,
					type: SheetAdjustmentTypeEnum.untyped,
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
					modifierType: ModifierTypeEnum.sheet,
					isActive: false,
					type: SheetAdjustmentTypeEnum.untyped,
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
					modifierType: ModifierTypeEnum.roll,
					isActive: true,
					type: SheetAdjustmentTypeEnum.status,
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
					modifierType: ModifierTypeEnum.sheet,
					isActive: false,
					type: SheetAdjustmentTypeEnum.untyped,
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
					modifierType: ModifierTypeEnum.roll,
					isActive: true,
					type: SheetAdjustmentTypeEnum.status,
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
			expect(SheetUtils.stringToSheetAdjustments(input)).toEqual(adjustments);
		});

		it('should throw an error for an invalid adjustment', () => {
			const input = 'Strength + foo';
			const sheet: Sheet = sheetWithTestProperties();
			expect(() => SheetUtils.stringToSheetAdjustments(input)).toThrow(KoboldError);
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
			const newAttackAdjustment = SheetUtils.stringToSheetAdjustments(
				'Claw attack = to hit +2 | damage 1d4 + 1 acid or piercing | traits: agile, finesse, unarmed | notes: "foo"'
			);
			const adjustedSheet = SheetUtils.adjustSheetWithSheetAdjustments(
				sheet,
				newAttackAdjustment
			);
			expect(adjustedSheet.attacks.length).toEqual(1);
			expect(adjustedSheet.attacks[0].name).toEqual('Claw');
			expect(adjustedSheet.attacks[0].toHit).toEqual(2);
			expect(adjustedSheet.attacks[0].traits).toEqual(['agile', 'finesse', 'unarmed']);
			expect(adjustedSheet.attacks[0].notes).toEqual('"foo"');
			expect(adjustedSheet.attacks[0].damage[0].dice).toEqual('1d4 + 1');
			expect(adjustedSheet.attacks[0].damage[0].type).toEqual('acid or piercing');
			expect(adjustedSheet.attacks[0].range).toBeNull();
		});

		it('allows a user to add a lore to a sheet', () => {
			const sheet: Sheet = sheetWithTestProperties();
			const newLoreAdjustment = SheetUtils.stringToSheetAdjustments(
				'kobold lore = -2; kobold lore ability=str'
			);
			const adjustedSheet = SheetUtils.adjustSheetWithSheetAdjustments(
				sheet,
				newLoreAdjustment
			);
			expect(adjustedSheet.additionalSkills.length).toEqual(1);
			expect(adjustedSheet.additionalSkills[0].name).toEqual('kobold lore');
			expect(adjustedSheet.additionalSkills[0].bonus).toEqual(-2);
			expect(adjustedSheet.additionalSkills[0].dc).toEqual(8);
			expect(adjustedSheet.additionalSkills[0].proficiency).toBeNull();
			expect(adjustedSheet.additionalSkills[0].ability).toEqual(AbilityEnum.strength);
		});

		it('allows a user to set weaknesses and resistances', () => {
			const sheet: Sheet = sheetWithTestProperties();
			const resistAndWeaknessAdjustments = SheetUtils.stringToSheetAdjustments(
				'fire resistance = 3; fire resist+1; multi word cold weakness +2'
			);
			const adjustedSheet = SheetUtils.adjustSheetWithSheetAdjustments(
				sheet,
				resistAndWeaknessAdjustments
			);
			expect(adjustedSheet.weaknessesResistances.resistances.length).toEqual(1);
			expect(adjustedSheet.weaknessesResistances.weaknesses.length).toEqual(1);
			expect(adjustedSheet.weaknessesResistances.weaknesses[0].type).toEqual(
				'multi word cold'
			);
			expect(adjustedSheet.weaknessesResistances.weaknesses[0].amount).toEqual(2);
			expect(adjustedSheet.weaknessesResistances.resistances[0].type).toEqual('fire');
			expect(adjustedSheet.weaknessesResistances.resistances[0].amount).toEqual(4);
		});

		it('allows a user to update stats', () => {
			const sheet: Sheet = sheetWithTestProperties();
			const statAdjustments = SheetUtils.stringToSheetAdjustments(
				'arcana = 4; will dc+1; class ability=con'
			);
			const adjustedSheet = SheetUtils.adjustSheetWithSheetAdjustments(
				sheet,
				statAdjustments
			);
			expect(adjustedSheet.stats.arcana.bonus).toEqual(4);
			expect(adjustedSheet.stats.will.dc).toEqual(11);
			expect(adjustedSheet.stats.class.ability).toEqual(AbilityEnum.constitution);

			expect(adjustedSheet.stats.arcana.dc).toBeNull();
			expect(adjustedSheet.stats.will.bonus).toBeNull();
			expect(adjustedSheet.stats.class.proficiency).toBeNull();
		});

		it('allows a user to update a base counter', () => {
			const sheet: Sheet = sheetWithTestProperties();
			sheet.baseCounters.hp.max = 10;
			sheet.baseCounters.hp.current = 10;
			const baseCounterAdjustments =
				SheetUtils.stringToSheetAdjustments('max hp + 4; hp - 1');
			const adjustedSheet = SheetUtils.adjustSheetWithSheetAdjustments(
				sheet,
				baseCounterAdjustments
			);
			expect(adjustedSheet.baseCounters.hp.max).toEqual(13);
			expect(adjustedSheet.baseCounters.tempHp.max).toBeNull();

			expect(adjustedSheet.baseCounters.hp.current).toEqual(10);
			expect(adjustedSheet.baseCounters.tempHp.current).toEqual(0);
		});

		it('allows a user to update an int property', () => {
			const sheet: Sheet = sheetWithTestProperties();
			sheet.intProperties.ac = 17;
			const intPropertyAdjustments = SheetUtils.stringToSheetAdjustments('ac=15; ac+1');
			const adjustedSheet = SheetUtils.adjustSheetWithSheetAdjustments(
				sheet,
				intPropertyAdjustments
			);
			expect(adjustedSheet.intProperties.ac).toEqual(16);
		});

		it('allows a user to update an info list property', () => {
			const sheet: Sheet = sheetWithTestProperties();
			const infoListPropertyAdjustments = SheetUtils.stringToSheetAdjustments(
				'languages = common; languages+draconic,elven'
			);
			const adjustedSheet = SheetUtils.adjustSheetWithSheetAdjustments(
				sheet,
				infoListPropertyAdjustments
			);
			expect(adjustedSheet.infoLists.languages).toEqual(['common', 'draconic', 'elven']);
		});

		it('allows a user to update an info property', () => {
			const sheet: Sheet = sheetWithTestProperties();
			const infoPropertyAdjustment = SheetUtils.stringToSheetAdjustments(
				'url=https://github.com/significantotter/kobold?foo=%27bar%27'
			);
			const adjustedSheet = SheetUtils.adjustSheetWithSheetAdjustments(
				sheet,
				infoPropertyAdjustment
			);
			expect(adjustedSheet.info.url).toEqual(
				'https://github.com/significantotter/kobold?foo=%27bar%27'
			);
		});

		it('does not allow a user to update a non-adjustable properties', () => {
			const sheet: Sheet = sheetWithTestProperties();
			expect(() => SheetUtils.stringToSheetAdjustments('name=fred')).toThrow(KoboldError);
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
