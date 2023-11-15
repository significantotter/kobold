import { AbilityEnum } from '../../services/kobold/index.js';
import { SheetProperties } from './sheet-properties.js';

describe('SheetProperties', () => {
	describe('standardizeProperty', () => {
		it('should standardize a property name', () => {
			expect(SheetProperties.standardizeProperty('Strength ')).toBe('strength');
		});

		it('should remove underscores and hyphens', () => {
			const result = SheetProperties.standardizeProperty('max_hp');
			expect(result).toBe('hp');
		});
	});

	describe('isPropertyGroup', () => {
		it('should return true for a valid property group', () => {
			expect(SheetProperties.isPropertyGroup('constitution-saves')).toBe(true);
			expect(SheetProperties.isPropertyGroup('skills')).toBe(true);
			expect(SheetProperties.isPropertyGroup('skill')).toBe(true);
			expect(SheetProperties.isPropertyGroup('intelligence casting dcs')).toBe(true);
			expect(SheetProperties.isPropertyGroup('con class-bonus')).toBe(true);
			expect(SheetProperties.isPropertyGroup('checksBonuses')).toBe(true);
		});

		it('should return false for an invalid property group', () => {
			expect(SheetProperties.isPropertyGroup('intelligence dcs')).toBe(false);
			expect(SheetProperties.isPropertyGroup('constitution')).toBe(false);
			expect(SheetProperties.isPropertyGroup('attacks')).toBe(false);
			expect(SheetProperties.isPropertyGroup('class attack')).toBe(false);
			expect(SheetProperties.isPropertyGroup('foo skills')).toBe(false);
			expect(SheetProperties.isPropertyGroup('skills-bar')).toBe(false);
		});
	});

	describe('propertyGroupToSheetProperties', () => {
		const sheet = SheetProperties.defaultSheet;
		it('should convert a valid property group to an array of sheet properties', () => {
			expect(SheetProperties.propertyGroupToSheetProperties(sheet, 'dex skills')).toEqual([
				'acrobaticsBonus',
				'acrobaticsDc',
				'stealthBonus',
				'stealthDc',
				'thieveryBonus',
				'thieveryDc',
			]);
			expect(
				SheetProperties.propertyGroupToSheetProperties(sheet, 'wisdom check dcs')
			).toEqual([
				'perceptionDc',
				'willDc',
				'medicineDc',
				'natureDc',
				'religionDc',
				'survivalDc',
			]);
		});

		it('should include additional skills', () => {
			const additionalSkillsSheet = SheetProperties.defaultSheet;
			additionalSkillsSheet.additionalSkills = [
				{
					name: 'esotericLore',
					proficiency: null,
					dc: null,
					bonus: null,
					ability: AbilityEnum.charisma,
					note: null,
				},
				{
					name: 'koboldsGonnaKobLore',
					proficiency: null,
					dc: null,
					bonus: null,
					ability: AbilityEnum.intelligence,
					note: null,
				},
				{
					name: 'someSkill',
					proficiency: null,
					dc: null,
					bonus: null,
					ability: AbilityEnum.strength,
					note: null,
				},
			];

			const testGroup = SheetProperties.propertyGroupToSheetProperties(
				additionalSkillsSheet,
				'skills'
			);

			[
				'esotericLoreDc',
				'esotericLoreBonus',
				'koboldsGonnaKobLoreDc',
				'koboldsGonnaKobLoreBonus',
				'someSkillDc',
				'someSkillBonus',
			].forEach(prop => expect(testGroup).toContain(prop));

			expect(
				SheetProperties.propertyGroupToSheetProperties(
					additionalSkillsSheet,
					'str skill dcs'
				)
			).toEqual(['athleticsDc', 'someSkillDc']);
		});

		it('should throw an error for an invalid property group', () => {
			expect(SheetProperties.propertyGroupToSheetProperties(sheet, 'foo')).toEqual([]);
		});
	});
});
