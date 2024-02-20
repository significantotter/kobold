import {
	AbilityEnum,
	AdjustablePropertyEnum,
	Sheet,
	SheetAdjustment,
	SheetAdjustmentOperationEnum,
	SheetAdjustmentTypeEnum,
} from 'kobold-db';
import { KoboldError } from '../KoboldError.js';
import {
	SheetAdditionalSkillAdjuster,
	SheetAdjuster,
	SheetAttackAdjuster,
	SheetBaseCounterAdjuster,
	SheetInfoAdjuster,
	SheetInfoListAdjuster,
	SheetIntegerAdjuster,
	SheetStatAdjuster,
	SheetWeaknessResistanceAdjuster,
} from './sheet-adjuster.js';
import { SheetProperties } from './sheet-properties.js';

describe('SheetAdjuster static', () => {
	let sheet: Sheet;
	let sheetAdjuster: SheetAdjuster;

	beforeEach(() => {
		sheet = SheetProperties.defaultSheet;
		sheetAdjuster = new SheetAdjuster(sheet);
	});

	describe('validateSheetProperty', () => {
		it('should return true if the property is valid for infoProperties', () => {
			expect(SheetAdjuster.validateSheetProperty('image-link')).toBe(true);
			expect(SheetAdjuster.validateSheetProperty('arcaneAttack')).toBe(true);
			expect(SheetAdjuster.validateSheetProperty('esoteric lore')).toBe(true);
			expect(SheetAdjuster.validateSheetProperty('str skills')).toBe(true);
			expect(SheetAdjuster.validateSheetProperty('checks')).toBe(true);
		});
		it('should return true if the property is valid for infoListProperties', () => {
			expect(SheetAdjuster.validateSheetProperty('sense')).toBe(true);
			expect(SheetAdjuster.validateSheetProperty('languages ')).toBe(true);
			expect(SheetAdjuster.validateSheetProperty('iMMune')).toBe(true);
		});
		it('should return true if the property is valid for integerProperties', () => {
			expect(SheetAdjuster.validateSheetProperty('ac')).toBe(true);
			expect(SheetAdjuster.validateSheetProperty('classDC')).toBe(true);
			expect(SheetAdjuster.validateSheetProperty('acrobaticsDc')).toBe(true);
			expect(SheetAdjuster.validateSheetProperty('a c')).toBe(true);
		});
		it('should return true if the property is valid for baseCounterProperties', () => {
			expect(SheetAdjuster.validateSheetProperty('max F_P')).toBe(true);
			expect(SheetAdjuster.validateSheetProperty('hit points')).toBe(true);
			expect(SheetAdjuster.validateSheetProperty('tem p-h p')).toBe(true);
		});
		it('should return true if the property is valid for statProperties', () => {
			expect(SheetAdjuster.validateSheetProperty('divine')).toBe(true);
			expect(SheetAdjuster.validateSheetProperty('occult-attack')).toBe(true);
			expect(SheetAdjuster.validateSheetProperty('class dC')).toBe(true);
			expect(SheetAdjuster.validateSheetProperty('willability')).toBe(true);
			expect(SheetAdjuster.validateSheetProperty(' arcana atk')).toBe(true);
			expect(SheetAdjuster.validateSheetProperty(' craftingbonus')).toBe(true);
		});
		it('should return true if the property is valid for attackProperties', () => {
			expect(SheetAdjuster.validateSheetProperty('claw attack')).toBe(true);
			expect(SheetAdjuster.validateSheetProperty('short sword attack')).toBe(true);
			expect(SheetAdjuster.validateSheetProperty('running-jump attack')).toBe(true);
		});
		it('should return true if the property is valid for additionalSkills', () => {
			expect(SheetAdjuster.validateSheetProperty('esoteric lore')).toBe(true);
			expect(SheetAdjuster.validateSheetProperty("kobold's gonna kob lore")).toBe(true);
			expect(SheetAdjuster.validateSheetProperty('a lore')).toBe(true);
		});
		it('should return true if the property is valid for resistances/weaknesses', () => {
			expect(SheetAdjuster.validateSheetProperty('fire weakness')).toBe(true);
			expect(SheetAdjuster.validateSheetProperty('cold resistance')).toBe(true);
			expect(SheetAdjuster.validateSheetProperty('all physical damage resistance')).toBe(
				true
			);
			expect(SheetAdjuster.validateSheetProperty('s resistance')).toBe(true);
		});
		it('should return true if the property is valid for attackProperties', () => {
			expect(SheetAdjuster.validateSheetProperty('claw attack')).toBe(true);
			expect(SheetAdjuster.validateSheetProperty('short sword attack')).toBe(true);
			expect(SheetAdjuster.validateSheetProperty('running-jump attack')).toBe(true);
		});
		it('should return false if the property is invalid', () => {
			expect(SheetAdjuster.validateSheetProperty('clawattack')).toBe(false);
			expect(SheetAdjuster.validateSheetProperty('foo checks')).toBe(false);
			expect(SheetAdjuster.validateSheetProperty('str foo')).toBe(false);
			expect(SheetAdjuster.validateSheetProperty('arcanaa')).toBe(false);
			expect(SheetAdjuster.validateSheetProperty('ac atk')).toBe(false);
			expect(SheetAdjuster.validateSheetProperty('bar')).toBe(false);
		});
	});

	describe('isAdjustableProperty', () => {
		it('should return true for an adjustable property', () => {
			expect(SheetAdjuster.isAdjustableProperty('strength')).toBe(true);
		});

		it('should return false for a non-adjustable property', () => {
			expect(SheetAdjuster.isAdjustableProperty('foo')).toBe(false);
			expect(SheetAdjuster.isAdjustableProperty('level')).toBe(false);
			expect(SheetAdjuster.isAdjustableProperty('name')).toBe(false);
			expect(SheetAdjuster.isAdjustableProperty('usesStamina')).toBe(false);
		});
	});
});

describe('SheetInfoAdjuster', () => {
	let sheet: Sheet;
	let sheetInfoAdjuster: SheetInfoAdjuster;

	beforeEach(() => {
		sheet = SheetProperties.defaultSheet;
		sheetInfoAdjuster = new SheetInfoAdjuster(sheet.info);
	});

	describe('adjust', () => {
		it('should add to a string property', () => {
			sheet.info.description = 'Foo';
			const adjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'description',
				propertyType: AdjustablePropertyEnum.info,
				operation: SheetAdjustmentOperationEnum['+'],
				value: ' Bar',
			};
			sheetInfoAdjuster.adjust(adjustment);
			expect(sheet.info.description).toBe('Foo Bar');
		});

		it('should set a string property', () => {
			sheet.info.description = 'Foo';
			const adjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'description',
				propertyType: AdjustablePropertyEnum.info,
				operation: SheetAdjustmentOperationEnum['='],
				value: 'Jane',
			};
			sheetInfoAdjuster.adjust(adjustment);
			expect(sheet.info.description).toBe('Jane');
		});

		it('should throw an error for an invalid adjustment', () => {
			sheet.info.description = 'Foo';
			const adjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'asdf',
				propertyType: AdjustablePropertyEnum.info,
				operation: SheetAdjustmentOperationEnum['-'],
				value: 'bar',
			};
			expect(() => sheetInfoAdjuster.adjust(adjustment)).toThrow(KoboldError);
		});
	});
});

describe('SheetInfoListAdjuster', () => {
	let sheet: Sheet;
	let sheetInfoListAdjuster: SheetInfoListAdjuster;

	beforeEach(() => {
		sheet = SheetProperties.defaultSheet;
		sheet.infoLists.languages = ['Draconic', 'Common'];
		sheetInfoListAdjuster = new SheetInfoListAdjuster(sheet.infoLists);
	});

	describe('adjust', () => {
		it('should add items to the list on +', () => {
			const adjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'languages',
				propertyType: AdjustablePropertyEnum.info,
				operation: SheetAdjustmentOperationEnum['+'],
				value: 'Dwarvish, Elvish',
			};
			sheetInfoListAdjuster.adjust(adjustment);
			expect(sheet.infoLists.languages.sort()).toEqual(
				['Dwarvish', 'Elvish', 'Draconic', 'Common'].sort()
			);
		});

		it('should remove an item from the list on -', () => {
			const adjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'languages',
				propertyType: AdjustablePropertyEnum.infoList,
				operation: SheetAdjustmentOperationEnum['-'],
				value: 'Draconic',
			};
			sheetInfoListAdjuster.adjust(adjustment);
			expect(sheet.infoLists.languages.sort()).toEqual(['Common'].sort());
		});

		it('should do nothing when removing if the item is not in the list on -', () => {
			const adjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'languages',
				propertyType: AdjustablePropertyEnum.infoList,
				operation: SheetAdjustmentOperationEnum['-'],
				value: 'Elvish',
			};
			sheetInfoListAdjuster.adjust(adjustment);
			expect(sheet.infoLists.languages.sort()).toEqual(['Draconic', 'Common'].sort());
		});

		it('should set the list on =', () => {
			const adjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'languages',
				propertyType: AdjustablePropertyEnum.infoList,
				operation: SheetAdjustmentOperationEnum['='],
				value: 'Undercommon, Goblin',
			};
			sheetInfoListAdjuster.adjust(adjustment);
			expect(sheet.infoLists.languages.sort()).toEqual(['Undercommon', 'Goblin'].sort());
		});
		it('should throw an error for an invalid adjustment', () => {
			const adjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'asdfawedf',
				propertyType: AdjustablePropertyEnum.infoList,
				operation: SheetAdjustmentOperationEnum['='],
				value: 'Undercommon, Goblin',
			};
			expect(() => sheetInfoListAdjuster.adjust(adjustment)).toThrow(KoboldError);
		});
	});
});

describe('SheetIntegerAdjustment', () => {
	let sheet: Sheet;
	let sheetIntegerAdjuster: SheetIntegerAdjuster;

	beforeEach(() => {
		sheet = SheetProperties.defaultSheet;
		sheet.intProperties.ac = 18;
		sheetIntegerAdjuster = new SheetIntegerAdjuster(sheet.intProperties);
	});

	describe('adjust', () => {
		it('should add to an integer property', () => {
			const adjustment = {
				type: SheetAdjustmentTypeEnum.circumstance,
				property: 'ac',
				propertyType: AdjustablePropertyEnum.intProperty,
				operation: SheetAdjustmentOperationEnum['+'],
				value: '3',
			};
			sheetIntegerAdjuster.adjust(adjustment);
			expect(sheet.intProperties.ac).toBe(21);
		});

		it('should subtract from an integer property', () => {
			const adjustment = {
				type: SheetAdjustmentTypeEnum.circumstance,
				property: 'ac',
				propertyType: AdjustablePropertyEnum.intProperty,
				operation: SheetAdjustmentOperationEnum['-'],
				value: '3',
			};
			sheetIntegerAdjuster.adjust(adjustment);
			expect(sheet.intProperties.ac).toBe(15);
		});

		it('should set an integer property', () => {
			const adjustment = {
				type: SheetAdjustmentTypeEnum.circumstance,
				property: 'ac',
				propertyType: AdjustablePropertyEnum.intProperty,
				operation: SheetAdjustmentOperationEnum['='],
				value: '16',
			};
			sheetIntegerAdjuster.adjust(adjustment);
			expect(sheet.intProperties.ac).toBe(16);
		});

		it('should throw an error for an invalid adjustment', () => {
			const adjustment = {
				type: SheetAdjustmentTypeEnum.circumstance,
				property: 'ac',
				propertyType: AdjustablePropertyEnum.intProperty,
				operation: SheetAdjustmentOperationEnum['+'],
				value: 'asdf',
			};
			expect(() => sheetIntegerAdjuster.adjust(adjustment)).toThrow(KoboldError);
		});
	});
});

describe('SheetBaseCounterAdjuster', () => {
	let sheet: Sheet;
	let sheetBaseCounterAdjuster: SheetBaseCounterAdjuster;

	beforeEach(() => {
		sheet = SheetProperties.defaultSheet;
		sheetBaseCounterAdjuster = new SheetBaseCounterAdjuster(sheet.baseCounters);
	});

	describe('adjust', () => {
		it('should add to a base counter property', () => {
			sheet.baseCounters.hp.max = 50;
			sheetBaseCounterAdjuster.adjust({
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'hp',
				propertyType: AdjustablePropertyEnum.baseCounter,
				operation: SheetAdjustmentOperationEnum['+'],
				value: '10',
			});
			expect(sheet.baseCounters.hp.max).toBe(60);
		});

		it('should subtract from a base counter property', () => {
			sheet.baseCounters.hp.max = 50;
			sheetBaseCounterAdjuster.adjust({
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'hp',
				propertyType: AdjustablePropertyEnum.baseCounter,
				operation: SheetAdjustmentOperationEnum['-'],
				value: '10',
			});
			expect(sheet.baseCounters.hp.max).toBe(40);
		});

		it('should set a base counter property', () => {
			sheet.baseCounters.hp.max = 50;
			sheetBaseCounterAdjuster.adjust({
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'hp',
				propertyType: AdjustablePropertyEnum.baseCounter,
				operation: SheetAdjustmentOperationEnum['='],
				value: '100',
			});
			expect(sheet.baseCounters.hp.max).toBe(100);
		});

		it('should do nothing for an invalid adjustment', () => {
			sheet.baseCounters.hp.max = 50;
			const adjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'qwer',
				propertyType: AdjustablePropertyEnum.baseCounter,
				operation: SheetAdjustmentOperationEnum['+'],
				value: 'asfd',
			};
			expect(() => sheetBaseCounterAdjuster.adjust(adjustment)).toThrow(KoboldError);
		});
	});
});

describe('SheetStatAdjuster', () => {
	let sheet: Sheet;
	let sheetStatAdjuster: SheetStatAdjuster;

	beforeEach(() => {
		sheet = SheetProperties.defaultSheet;
		sheetStatAdjuster = new SheetStatAdjuster(sheet.stats);
	});

	describe('adjust', () => {
		it('should add to a stat property', () => {
			sheet.stats.arcane.dc = 10;
			const adjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'arcaneDc',
				propertyType: AdjustablePropertyEnum.stat,
				operation: SheetAdjustmentOperationEnum['+'],
				value: '2',
			};
			sheetStatAdjuster.adjust(adjustment);
			expect(sheet.stats.arcane.dc).toBe(12);
		});

		it('should subtract from a stat property', () => {
			sheet.stats.arcane.dc = 10;
			const adjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'arcaneDc',
				propertyType: AdjustablePropertyEnum.stat,
				operation: SheetAdjustmentOperationEnum['-'],
				value: '2',
			};
			sheetStatAdjuster.adjust(adjustment);
			expect(sheet.stats.arcane.dc).toBe(8);
		});

		it('should set a stat property', () => {
			sheet.stats.arcane.dc = 10;
			const adjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'arcaneDc',
				propertyType: AdjustablePropertyEnum.stat,
				operation: SheetAdjustmentOperationEnum['='],
				value: '15',
			};
			sheetStatAdjuster.adjust(adjustment);
			expect(sheet.stats.arcane.dc).toBe(15);
		});

		it('should throw an error for an invalid adjustment', () => {
			sheet.stats.arcane.dc = 10;
			const adjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'arcaneDc',
				propertyType: AdjustablePropertyEnum.stat,
				operation: SheetAdjustmentOperationEnum['+'],
				value: 'foo',
			};
			expect(() => sheetStatAdjuster.adjust(adjustment)).toThrow(KoboldError);
		});
	});
});

describe('SheetAttackAdjuster', () => {
	let sheet: Sheet;
	let sheetAttackAdjuster: SheetAttackAdjuster;

	beforeEach(() => {
		sheet = SheetProperties.defaultSheet;
		sheet.attacks = [
			{
				toHit: 10,
				damage: [{ dice: '1d4', type: 'cold' }],
				name: 'Bar',
				range: null,
				traits: [],
				effects: [],
				notes: 'Bar',
			},
		];
		sheetAttackAdjuster = new SheetAttackAdjuster(sheet.attacks);
	});

	describe('adjust', () => {
		it('should add to the attack list with +', () => {
			const adjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'Foo attack',
				propertyType: AdjustablePropertyEnum.attack,
				operation: SheetAdjustmentOperationEnum['+'],
				value: 'to hit: +5 | damage: 1d6 cold or fire',
			};
			sheetAttackAdjuster.adjust(adjustment);
			expect(sheet.attacks).toContainEqual({
				toHit: 5,
				damage: [{ dice: '1d6', type: 'cold or fire' }],
				effects: [],
				name: 'Foo',
				range: null,
				traits: [],
				notes: null,
			});
			expect(sheet.attacks.length).toBe(2);
		});

		it('should also add to the attack list with =', () => {
			const adjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'Foo attack',
				propertyType: AdjustablePropertyEnum.attack,
				operation: SheetAdjustmentOperationEnum['='],
				value: 'to hit: +5 | damage: 1d6 cold or fire',
			};
			sheetAttackAdjuster.adjust(adjustment);
			expect(sheet.attacks).toContainEqual({
				toHit: 5,
				damage: [{ dice: '1d6', type: 'cold or fire' }],
				effects: [],
				name: 'Foo',
				range: null,
				traits: [],
				notes: null,
			});
			expect(sheet.attacks.length).toBe(2);
		});

		it('should replace any existing attacks with the same name when adding', () => {
			sheet.attacks.push({
				toHit: 14,
				damage: [{ dice: '2d8', type: 'fire' }],
				name: 'Foo',
				range: null,
				traits: [],
				effects: [],
				notes: 'Foo',
			});
			const adjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'Foo attack',
				propertyType: AdjustablePropertyEnum.attack,
				operation: SheetAdjustmentOperationEnum['+'],
				value: 'to hit: +5 | damage: 1d6 cold or fire',
			};
			sheetAttackAdjuster.adjust(adjustment);
			expect(sheet.attacks).toContainEqual({
				toHit: 5,
				damage: [{ dice: '1d6', type: 'cold or fire' }],
				effects: [],
				name: 'Foo',
				range: null,
				traits: [],
				notes: null,
			});
			expect(sheet.attacks.length).toBe(2);
		});

		it('should remove any existing attacks with the same name with the - operator', () => {
			sheet.attacks.push({
				toHit: 14,
				damage: [{ dice: '2d8', type: 'fire' }],
				name: 'Foo',
				range: null,
				traits: [],
				effects: [],
				notes: 'Foo',
			});
			const adjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'Foo attack',
				propertyType: AdjustablePropertyEnum.attack,
				operation: SheetAdjustmentOperationEnum['-'],
				value: '',
			};
			sheetAttackAdjuster.adjust(adjustment);
			expect(sheet.attacks).toEqual([
				{
					toHit: 10,
					damage: [{ dice: '1d4', type: 'cold' }],
					effects: [],
					name: 'Bar',
					range: null,
					traits: [],
					notes: 'Bar',
				},
			]);
		});

		it('should throw an error for an invalid adjustment', () => {
			const adjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'asdf attack',
				propertyType: AdjustablePropertyEnum.attack,
				operation: SheetAdjustmentOperationEnum['+'],
				value: '',
			};
			expect(() => sheetAttackAdjuster.adjust(adjustment)).toThrow(KoboldError);
		});
	});
});

describe('SheetAdditionalSkillAdjuster', () => {
	let adjuster: SheetAdditionalSkillAdjuster;
	let sheet: Sheet;

	beforeEach(() => {
		sheet = SheetProperties.defaultSheet;
		sheet.additionalSkills = [
			{
				name: 'kobold lore',
				dc: 16,
				proficiency: 6,
				bonus: 6,
				ability: null,
				note: null,
			},
		];
		adjuster = new SheetAdditionalSkillAdjuster(sheet.additionalSkills);
	});

	describe('adjust', () => {
		it('should add to an existing additional skill property', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				value: '2',
				property: 'Kobold Lore',
				propertyType: AdjustablePropertyEnum.extraSkill,
				operation: SheetAdjustmentOperationEnum['+'],
			};
			adjuster.adjust(adjustment);
			expect(sheet.additionalSkills[0].bonus).toBe(8);
			expect(sheet.additionalSkills[0].dc).toBe(16);
		});

		it('should subtract from an additional skill property', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				value: '1',
				property: 'Kobold Lore Dc',
				propertyType: AdjustablePropertyEnum.extraSkill,
				operation: SheetAdjustmentOperationEnum['-'],
			};
			adjuster.adjust(adjustment);
			expect(sheet.additionalSkills[0].bonus).toBe(6);
			expect(sheet.additionalSkills[0].dc).toBe(15);
		});

		it('should set an additional skill property', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				value: '5',
				property: 'Kobold Lore',
				propertyType: AdjustablePropertyEnum.extraSkill,
				operation: SheetAdjustmentOperationEnum['='],
			};
			adjuster.adjust(adjustment);
			expect(sheet.additionalSkills[0].bonus).toBe(5);
			expect(sheet.additionalSkills[0].dc).toBe(16);
		});

		it('create a new additional skill property, adding both dc and bonus if either is specified', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				value: '7',
				property: 'Esoteric Lore',
				propertyType: AdjustablePropertyEnum.extraSkill,
				operation: SheetAdjustmentOperationEnum['='],
			};
			const adjustment2: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				value: AbilityEnum.charisma,
				property: 'Esoteric Lore Ability',
				propertyType: AdjustablePropertyEnum.extraSkill,
				operation: SheetAdjustmentOperationEnum['='],
			};
			const adjustment3: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				value: '14',
				property: 'Dragon Lore Dc',
				propertyType: AdjustablePropertyEnum.extraSkill,
				operation: SheetAdjustmentOperationEnum['='],
			};
			adjuster.adjust(adjustment);
			adjuster.adjust(adjustment2);
			adjuster.adjust(adjustment3);
			expect(sheet.additionalSkills[1].bonus).toBe(7);
			expect(sheet.additionalSkills[1].dc).toBe(17);
			expect(sheet.additionalSkills[1].ability).toBe(AbilityEnum.charisma);
			expect(sheet.additionalSkills[2].bonus).toBe(4);
			expect(sheet.additionalSkills[2].dc).toBe(14);
			expect(sheet.additionalSkills[2].ability).toBe(AbilityEnum.intelligence);
		});

		it('should do nothing for an invalid adjustment', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				value: 'foo',
				property: 'Kobold Lore',
				propertyType: AdjustablePropertyEnum.extraSkill,
				operation: SheetAdjustmentOperationEnum['+'],
			};
			expect(() => adjuster.adjust(adjustment)).toThrow(KoboldError);
		});
	});
});

describe('SheetWeaknessResistanceAdjuster', () => {
	let adjuster: SheetWeaknessResistanceAdjuster;
	let sheet: Sheet;

	beforeEach(() => {
		sheet = SheetProperties.defaultSheet;
		sheet.weaknessesResistances = {
			weaknesses: [
				{
					type: 'Fire',
					amount: 5,
				},
			],
			resistances: [
				{
					type: 'Fire',
					amount: 3,
				},
			],
		};
		adjuster = new SheetWeaknessResistanceAdjuster(sheet.weaknessesResistances);
	});

	describe('adjust', () => {
		it('should add to a weakness property', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				value: '2',
				property: 'fire weakness',
				propertyType: AdjustablePropertyEnum.weaknessResistance,
				operation: SheetAdjustmentOperationEnum['+'],
			};
			adjuster.adjust(adjustment);
			expect(sheet.weaknessesResistances.weaknesses[0].amount).toBe(7);
		});

		it('should subtract from a weakness property', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				value: '1',
				property: 'fire weakness',
				propertyType: AdjustablePropertyEnum.weaknessResistance,
				operation: SheetAdjustmentOperationEnum['-'],
			};
			adjuster.adjust(adjustment);
			expect(sheet.weaknessesResistances.weaknesses[0].amount).toBe(4);
		});

		it('should set a weakness property', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				value: '6',
				property: 'fire weakness',
				propertyType: AdjustablePropertyEnum.weaknessResistance,
				operation: SheetAdjustmentOperationEnum['='],
			};
			adjuster.adjust(adjustment);
			expect(sheet.weaknessesResistances.weaknesses[0].amount).toBe(6);
		});

		it('should add to a resistance property', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				value: '2',
				property: 'fire resistance',
				propertyType: AdjustablePropertyEnum.weaknessResistance,
				operation: SheetAdjustmentOperationEnum['+'],
			};
			adjuster.adjust(adjustment);
			expect(sheet.weaknessesResistances.resistances[0].amount).toBe(5);
		});

		it('should subtract from a resistance property', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				value: '1',
				property: 'fire resistance',
				propertyType: AdjustablePropertyEnum.weaknessResistance,
				operation: SheetAdjustmentOperationEnum['-'],
			};
			adjuster.adjust(adjustment);
			expect(sheet.weaknessesResistances.resistances[0].amount).toBe(2);
		});

		it('should set a resistance property', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				value: '5',
				property: 'fire resistance',
				propertyType: AdjustablePropertyEnum.weaknessResistance,
				operation: SheetAdjustmentOperationEnum['='],
			};
			adjuster.adjust(adjustment);
			expect(sheet.weaknessesResistances.resistances[0].amount).toBe(5);
		});

		it('should throw an error for an invalid adjustment', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				value: '2',
				property: 'Invalid Property',
				propertyType: AdjustablePropertyEnum.weaknessResistance,
				operation: SheetAdjustmentOperationEnum['+'],
			};
			expect(() => adjuster.adjust(adjustment)).toThrow();
		});
	});
});
