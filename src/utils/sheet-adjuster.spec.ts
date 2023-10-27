import {
	AdjustablePropertyEnum,
	Sheet,
	SheetAdjustmentOperationEnum,
	SheetAdjustmentTypeEnum,
} from '../services/kobold/models/index.js';
import {
	SheetAdjuster,
	SheetBaseCounterAdjuster,
	SheetInfoAdjuster,
	SheetInfoListAdjuster,
	SheetIntegerAdjuster,
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

	describe('standardizeProperty', () => {
		it('should standardize a property name', () => {
			expect(SheetAdjuster.standardizeProperty('Strength ')).toBe('strength');
		});

		it('should remove underscores and hyphens', () => {
			const result = SheetAdjuster.standardizeProperty('max_hp');
			expect(result).toBe('hp');
		});
	});
});

describe('SheetAdjuster instance', () => {
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

		it('should do nothing for an invalid adjustment', () => {
			sheet.info.description = 'Foo';
			const adjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'description',
				propertyType: AdjustablePropertyEnum.info,
				operation: SheetAdjustmentOperationEnum['-'],
				value: 'bar',
			};
			sheetInfoAdjuster.adjust(adjustment as any);
			expect(sheet.info.description).toBe('Foo');
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

		it('should do nothing for an invalid adjustment', () => {
			const adjustment = {
				type: SheetAdjustmentTypeEnum.circumstance,
				property: 'ac',
				propertyType: AdjustablePropertyEnum.intProperty,
				operation: SheetAdjustmentOperationEnum['+'],
				value: 'asdf',
			};
			sheetIntegerAdjuster.adjust(adjustment);
			expect(sheet.intProperties.ac).toBe(18);
		});
	});
});

describe('SheetBaseCounterAdjuster', () => {
	let sheet: Sheet;
	let sheetIntegerAdjuster: SheetBaseCounterAdjuster;

	beforeEach(() => {
		sheet = SheetProperties.defaultSheet;
		sheetIntegerAdjuster = new SheetBaseCounterAdjuster(sheet.baseCounters);
	});

	describe('adjust', () => {
		it('should add to a base counter property', () => {
			sheet.baseCounters.hp.max = 50;
			sheetIntegerAdjuster.adjust({
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
			sheetIntegerAdjuster.adjust({
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
			sheetIntegerAdjuster.adjust({
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
			sheetIntegerAdjuster.adjust({
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'hp',
				propertyType: AdjustablePropertyEnum.baseCounter,
				operation: SheetAdjustmentOperationEnum['+'],
				value: 'asfd',
			});
			expect(sheet.baseCounters.hp.max).toBe(50);
		});
	});
});
