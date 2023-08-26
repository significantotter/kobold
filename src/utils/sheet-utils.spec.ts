import _ from 'lodash';
import type {
	reducedSheetAdjustment,
	typedSheetAdjustment,
	untypedAdjustment,
} from './sheet-utils.js';
import { SheetUtils } from './sheet-utils.js';
import { Character, Sheet } from '../services/kobold/models/index.js';

describe('SheetUtils', () => {
	describe('standardizeSheetProperty', () => {
		it('should return the standard property name for a given property given the property name', () => {
			expect(SheetUtils.standardizeSheetProperty('arcaneDC')).toBe('arcaneDC');
			expect(SheetUtils.standardizeSheetProperty('arcane_attack')).toBe('arcaneAttack');
			expect(SheetUtils.standardizeSheetProperty('class_d_c')).toBe('classDC');
		});
		it('should return shorthands ignoring case and the presence of " ", "_", or "-"', () => {
			expect(SheetUtils.standardizeSheetProperty('armor')).toBe('ac');
			expect(SheetUtils.standardizeSheetProperty('A R_MO-R')).toBe('ac');
			expect(SheetUtils.standardizeSheetProperty('a c')).toBe('ac');
			expect(SheetUtils.standardizeSheetProperty('a-c')).toBe('ac');
			expect(SheetUtils.standardizeSheetProperty('a_c')).toBe('ac');
		});
	});
	describe('validateSheetProperty', () => {
		it('should return true if the property is valid', () => {
			expect(SheetUtils.validateSheetProperty('ac')).toBe(true);
			expect(SheetUtils.validateSheetProperty('classDC')).toBe(true);
			expect(SheetUtils.validateSheetProperty('arcaneAttack')).toBe(true);
			expect(SheetUtils.validateSheetProperty('fire weakness')).toBe(true);
			expect(SheetUtils.validateSheetProperty('cold weakness')).toBe(true);
			expect(SheetUtils.validateSheetProperty('darkvision sense')).toBe(true);
			expect(SheetUtils.validateSheetProperty('sonic immunity')).toBe(true);
			expect(SheetUtils.validateSheetProperty('common language')).toBe(true);
			expect(SheetUtils.validateSheetProperty('a c')).toBe(true);
			expect(SheetUtils.validateSheetProperty('str skills')).toBe(true);
			expect(SheetUtils.validateSheetProperty('checks')).toBe(true);
		});
		it('should return false if the property is invalid', () => {
			expect(SheetUtils.validateSheetProperty('foo checks')).toBe(false);
			expect(SheetUtils.validateSheetProperty('str foo')).toBe(false);
			expect(SheetUtils.validateSheetProperty('bar')).toBe(false);
		});
	});
	describe('sheetPropertyIsNumeric', () => {
		it('should return true if the property is numeric', () => {
			expect(SheetUtils.sheetPropertyIsNumeric('ac')).toBe(true);
			expect(SheetUtils.sheetPropertyIsNumeric('classDC')).toBe(true);
			expect(SheetUtils.sheetPropertyIsNumeric('arcaneAttack')).toBe(true);
			expect(SheetUtils.sheetPropertyIsNumeric('fire weakness')).toBe(true);
			expect(SheetUtils.sheetPropertyIsNumeric('darkvision sense')).toBe(false);
			expect(SheetUtils.sheetPropertyIsNumeric('sonic immunity')).toBe(false);
			expect(SheetUtils.sheetPropertyIsNumeric('common language')).toBe(false);
			expect(SheetUtils.sheetPropertyIsNumeric('a c')).toBe(true);
			expect(SheetUtils.sheetPropertyIsNumeric('str skills')).toBe(true);
			expect(SheetUtils.sheetPropertyIsNumeric('checks')).toBe(true);
			expect(SheetUtils.sheetPropertyIsNumeric('imageURL')).toBe(false);
		});
	});
	describe('applySheetAdjustmentToProperty', () => {
		it('should return the value of the modifier if the operation is "="', () => {
			expect(
				SheetUtils.applySheetAdjustmentToProperty(1, { operation: '=', value: '2' })
			).toBe('2');
		});
		it('should return the sum of the property and the modifier if the operation is "+"', () => {
			expect(
				SheetUtils.applySheetAdjustmentToProperty(1, { operation: '+', value: '2' })
			).toBe(3);
		});
		it('should return the difference of the property and the modifier if the operation is "-"', () => {
			expect(
				SheetUtils.applySheetAdjustmentToProperty(1, { operation: '-', value: '2' })
			).toBe(-1);
		});
		it('should return the property if the operation is not "=" or "+" or "-"', () => {
			expect(
				SheetUtils.applySheetAdjustmentToProperty(1, {
					operation: 'q',
					value: '2',
				} as unknown as any)
			).toBe(1);
		});
	});
	describe('bucketSheetAdjustmentsByType', () => {
		it('Takes the max of positive values of the same type, ignoring negatives', () => {
			const result = SheetUtils.bucketSheetAdjustmentsByType([
				// base value to be overwritten
				{ property: 'foo', type: 'status', operation: '+', value: '2' },
				// value that overwrites as the max
				{ property: 'foo', type: 'status', operation: '+', value: '4' },
				// won't overwrite due to different type
				{ property: 'foo', type: 'circumstance', operation: '+', value: '8' },
				// won't overwrite due to different property
				{ property: 'bar', type: 'status', operation: '+', value: '8' },
				// won't overwrite due to being negative
				{ property: 'foo', type: 'status', operation: '-', value: '1' },
			]);
			expect(result.positiveTypedSheetAdjustments['foo']['status']).toBe(4);
		});
		it('Takes the min of negative values of the same type, ignoring positive', () => {
			const result = SheetUtils.bucketSheetAdjustmentsByType([
				// base value to be overwritten
				{ property: 'foo', type: 'status', operation: '-', value: '2' },
				// value that overwrites as the min
				{ property: 'foo', type: 'status', operation: '-', value: '4' },
				// won't overwrite due to different type
				{ property: 'foo', type: 'circumstance', operation: '-', value: '8' },
				// won't overwrite due to different property
				{ property: 'bar', type: 'status', operation: '-', value: '8' },
				// won't overwrite due to being positive
				{ property: 'foo', type: 'status', operation: '+', value: '1' },
			]);
			expect(result.negativeTypedSheetAdjustments['foo']['status']).toBe(-4);
		});

		it('combines together untyped values no matter the operator', () => {
			const result = SheetUtils.bucketSheetAdjustmentsByType([
				// base negative value to be combined
				{ property: 'foo', type: 'untyped', operation: '-', value: '1' },
				// value that combines
				{ property: 'foo', type: 'untyped', operation: '-', value: '3' },
				// base positive value to be combined
				{ property: 'foo', type: 'untyped', operation: '+', value: '2' },
				// value that combines
				{ property: 'foo', type: 'untyped', operation: '+', value: '1' },
				// won't combine due to being an overwrite
				{ property: 'foo', type: 'untyped', operation: '=', value: '4' },
				// won't combine due to different type
				{ property: 'foo', type: 'circumstance', operation: '-', value: '8' },
				// won't combine due to different property
				{ property: 'bar', type: 'untyped', operation: '-', value: '8' },
			]);
			expect(result.positiveTypedSheetAdjustments['foo']['untyped']).toBe(3);
			expect(result.negativeTypedSheetAdjustments['foo']['untyped']).toBe(-4);
			expect(result.overwriteSheetAdjustments['foo']).toBe('4');
		});
		it('passes through an overwrite sheet adjustment no matter other adjustments', () => {
			const result = SheetUtils.bucketSheetAdjustmentsByType([
				// base value to be overwritten
				{ property: 'foo', type: 'untyped', operation: '=', value: '4' },
				// value that overwrites as the most recent
				{ property: 'foo', type: 'untyped', operation: '=', value: '1' },
				// value that overwrites as the most recent
				{ property: 'foo', type: 'untyped', operation: '=', value: '2' },
				// won't combine due to different operation
				{ property: 'foo', type: 'circumstance', operation: '-', value: '8' },
				// won't combine due to different property
				{ property: 'bar', type: 'untyped', operation: '=', value: '8' },
			]);
			expect(result.overwriteSheetAdjustments['foo']).toBe('2');
			expect(result.negativeTypedSheetAdjustments['foo']['circumstance']).toBe('-8');
			expect(result.overwriteSheetAdjustments['bar']).toBe('8');
		});
		it('properly returns empty objects if no values are provided', () => {
			const result = SheetUtils.bucketSheetAdjustmentsByType([]);
			expect(result.positiveTypedSheetAdjustments).toStrictEqual({});
			expect(result.negativeTypedSheetAdjustments).toStrictEqual({});
			expect(result.overwriteSheetAdjustments).toStrictEqual({});
		});
	});
	describe('reduceSheetAdjustmentsByType', () => {
		it('joins positive and negative sheet adjustments together of the same types', () => {
			const positiveTypedSheetAdjustments = {
				foo: { status: 1 },
				bar: { status: 6 },
			};
			const negativeTypedSheetAdjustments = {
				foo: { circumstance: -3 },
				bar: { status: -2, circumstance: -1 },
			};
			const overwriteSheetAdjustments = {};
			const result = SheetUtils.reduceSheetAdjustmentsByType(
				positiveTypedSheetAdjustments,
				negativeTypedSheetAdjustments,
				overwriteSheetAdjustments
			);
			expect(result.modifySheetAdjustments['foo']).toBe(-2);
			expect(result.modifySheetAdjustments['bar']).toBe(3);
		});
		it('passes through overwrite values', () => {
			const positiveTypedSheetAdjustments = {
				foo: { status: 1 },
				bar: { status: 6 },
			};
			const negativeTypedSheetAdjustments = {
				foo: { circumstance: -3 },
				bar: { status: -2, circumstance: -1 },
			};
			const overwriteSheetAdjustments = {
				foo: 5,
				bar: -5,
			};
			const result = SheetUtils.reduceSheetAdjustmentsByType(
				positiveTypedSheetAdjustments,
				negativeTypedSheetAdjustments,
				overwriteSheetAdjustments
			);
			expect(result.modifySheetAdjustments['foo']).toBe(-2);
			expect(result.modifySheetAdjustments['bar']).toBe(3);
			expect(result.overwriteSheetAdjustments['foo']).toBe(5);
			expect(result.overwriteSheetAdjustments['bar']).toBe(-5);
		});
		it('handles empty objects properly', () => {
			const positiveTypedSheetAdjustments = {};
			const negativeTypedSheetAdjustments = {};
			const overwriteSheetAdjustments = {};
			const result = SheetUtils.reduceSheetAdjustmentsByType(
				positiveTypedSheetAdjustments,
				negativeTypedSheetAdjustments,
				overwriteSheetAdjustments
			);
			expect(result.modifySheetAdjustments).toStrictEqual({});
			expect(result.overwriteSheetAdjustments).toStrictEqual({});
		});
	});
	describe('spreadSheetAdjustmentGroups', () => {
		it('should handle each group without an attribute', () => {
			const sheetAdjustments: typedSheetAdjustment[] = [
				{ property: 'skills', type: 'status', operation: '+', value: '1' },
				{ property: 'saves', type: 'circumstance', operation: '+', value: '2' },
				{ property: 'checks', type: 'item', operation: '+', value: '3' },
			];
			const expectedResult: typedSheetAdjustment[] = [
				...([
					'arcana',
					'crafting',
					'lores',
					'medicine',
					'occultism',
					'society',
					'medicine',
					'nature',
					'survival',
					'religion',
					'diplomacy',
					'intimidation',
					'performance',
					'deception',
					'athletics',
					'acrobatics',
					'stealth',
					'thievery',
				].map(skill => ({
					property: skill,
					type: 'status',
					operation: '+',
					value: '1',
				})) as typedSheetAdjustment[]),
				...(['fortitude', 'reflex', 'will'].map(skill => ({
					property: skill,
					type: 'circumstance',
					operation: '+',
					value: '2',
				})) as typedSheetAdjustment[]),
				...([
					'arcana',
					'crafting',
					'lores',
					'medicine',
					'occultism',
					'society',
					'medicine',
					'nature',
					'survival',
					'religion',
					'diplomacy',
					'intimidation',
					'performance',
					'deception',
					'athletics',
					'acrobatics',
					'stealth',
					'thievery',
					'perception',
					'fortitude',
					'reflex',
					'will',
				].map(skill => ({
					property: skill,
					type: 'item',
					operation: '+',
					value: '3',
				})) as typedSheetAdjustment[]),
			];
			const sheet = SheetUtils.defaultSheet;
			const result = SheetUtils.spreadSheetAdjustmentGroups(sheetAdjustments, sheet);
			expect(result).toEqual(expect.arrayContaining(expectedResult));
			expect(expectedResult).toEqual(expect.arrayContaining(result));
		});
		it('should handle lores', () => {
			const sheet = _.cloneDeep(SheetUtils.defaultSheet);
			sheet.skills.lores = [
				{ name: 'kobold', bonus: 5, profMod: 2 },
				{ name: 'underground', bonus: 7, profMod: 4 },
			];
			const sheetAdjustments: typedSheetAdjustment[] = [
				{ property: 'skills', type: 'status', operation: '+', value: '1' },
				{ property: 'saves', type: 'circumstance', operation: '+', value: '2' },
				{ property: 'checks', type: 'item', operation: '+', value: '3' },
			];
			const someExpectedContents: typedSheetAdjustment[] = [
				{ property: 'kobold lore', type: 'status', operation: '+', value: '1' },
				{ property: 'underground lore', type: 'status', operation: '+', value: '1' },
				{ property: 'kobold lore', type: 'item', operation: '+', value: '3' },
				{ property: 'underground lore', type: 'item', operation: '+', value: '3' },
			];
			const result = SheetUtils.spreadSheetAdjustmentGroups(sheetAdjustments, sheet);
			expect(result).toEqual(expect.arrayContaining(someExpectedContents));
		});
		it('should handle groups limited to attributes', () => {
			const sheetAdjustments: typedSheetAdjustment[] = [
				{ property: 'dex skills', type: 'status', operation: '+', value: '1' },
				{
					property: 'constitution saves',
					type: 'circumstance',
					operation: '+',
					value: '2',
				},
				{ property: 'wis checks', type: 'item', operation: '+', value: '3' },
			];
			const expectedResult: typedSheetAdjustment[] = [
				...(['acrobatics', 'stealth', 'thievery'].map(skill => ({
					property: skill,
					type: 'status',
					operation: '+',
					value: '1',
				})) as typedSheetAdjustment[]),
				...(['fortitude'].map(skill => ({
					property: skill,
					type: 'circumstance',
					operation: '+',
					value: '2',
				})) as typedSheetAdjustment[]),
				...(['medicine', 'nature', 'survival', 'religion', 'perception', 'will'].map(
					skill => ({
						property: skill,
						type: 'item',
						operation: '+',
						value: '3',
					})
				) as typedSheetAdjustment[]),
			];
			const sheet = SheetUtils.defaultSheet;
			const result = SheetUtils.spreadSheetAdjustmentGroups(sheetAdjustments, sheet);
			expect(result).toEqual(expect.arrayContaining(expectedResult));
			expect(expectedResult).toEqual(expect.arrayContaining(result));
		});
	});
	describe('parseSheetModifiers', () => {
		it('should parses a list of sheet modifiers', () => {
			const modifiers: Character['modifiers'] = [
				{
					name: 'foo',
					isActive: true,
					description: 'bar',
					type: 'status',
					targetTags: 'baz',
					value: 1,
					modifierType: 'sheet',
					sheetAdjustments: [
						{
							property: 'dex checks',
							operation: '+',
							value: '1',
						},
						{
							property: 'thievery',
							operation: '+',
							value: '2',
						},
					],
				},
				{
					name: 'notActive',
					isActive: false,
					description: 'bar',
					type: 'status',
					targetTags: 'baz',
					value: 1,
					modifierType: 'sheet',
					sheetAdjustments: [
						{
							property: 'dex checks',
							operation: '-',
							value: '1',
						},
						{
							property: 'thievery',
							operation: '-',
							value: '2',
						},
					],
				},
				{
					name: 'bar',
					isActive: true,
					description: 'bar',
					type: 'circumstance',
					targetTags: 'baz',
					value: 1,
					modifierType: 'sheet',
					sheetAdjustments: [
						{
							property: 'perception',
							operation: '+',
							value: '1',
						},
						{
							property: 'stealth',
							operation: '+',
							value: '3',
						},
						{
							property: 'ac',
							operation: '+',
							value: '2',
						},
					],
				},
				{
					name: 'baz',
					isActive: true,
					description: 'bar',
					type: 'item',
					targetTags: 'baz',
					value: 1,
					modifierType: 'sheet',
					sheetAdjustments: [
						{
							property: 'ac',
							operation: '=',
							value: '18',
						},
						{
							property: 'imageUrl',
							operation: '=',
							value: 'https://foo.com/bar.png',
						},
					],
				},
			];
			const expectedModifySheetAdjustments: untypedAdjustment = {
				acrobatics: 1,
				stealth: 4,
				thievery: 2,
				reflex: 1,
				perception: 1,
				ac: 2,
			};
			const expectedOverwriteSheetAdjustments: untypedAdjustment = {
				ac: '18',
				imageURL: 'https://foo.com/bar.png',
			};

			const results = SheetUtils.parseSheetModifiers(SheetUtils.defaultSheet, modifiers);
			expect(results.modifySheetAdjustments).toEqual(expectedModifySheetAdjustments);
			expect(results.overwriteSheetAdjustments).toEqual(expectedOverwriteSheetAdjustments);
		});
	});
	describe('applySheetAdjustments', () => {
		it('should apply sheet modifiers to a sheet', () => {
			const sheet: Sheet = _.cloneDeep(SheetUtils.defaultSheet);
			sheet.defenses.ac = 14;
			sheet.skills.acrobatics = 3;
			sheet.skills.stealth = 1;

			const overwriteSheetAdjustments: untypedAdjustment = {
				ac: '18',
				imageURL: 'https://foo.com/bar.png',
			};
			const modifySheetAdjustments: untypedAdjustment = {
				acrobatics: 1,
				stealth: 4,
				thievery: 2,
				reflex: 1,
				perception: 1,
				ac: 2,
			};
			const results = SheetUtils.applySheetAdjustments(
				sheet,
				overwriteSheetAdjustments,
				modifySheetAdjustments
			);
			const resultSheet: Sheet = {
				info: { traits: [], imageURL: 'https://foo.com/bar.png' },
				general: {
					senses: [],
					languages: [],
					perception: 1,
				},
				abilities: {},
				defenses: { resistances: [], immunities: [], weaknesses: [], ac: 20 },
				offense: {},
				castingStats: {},
				saves: { reflex: 1 },
				skills: { lores: [], acrobatics: 4, stealth: 5, thievery: 2 },
				attacks: [],
				rollMacros: [],
				actions: [],
				modifiers: [],
				sourceData: {},
			};
			expect(results).toEqual(resultSheet);
		});
		it('Applies lores modifiers to a sheet', () => {
			const sheet: Sheet = _.cloneDeep(SheetUtils.defaultSheet);
			sheet.skills.lores = [
				{ name: 'kobold', bonus: 5, profMod: 2 },
				{ name: 'underground', bonus: 7, profMod: 4 },
				{ name: 'warfare', bonus: 5, profMod: 2 },
			];
			const overwriteSheetAdjustments: untypedAdjustment = {
				'warfare lore': 2,
				'esoteric lore': 5,
			};
			const modifySheetAdjustments: untypedAdjustment = {
				'kobold lore': 1,
				'underground lore': 2,
				'warfare lore': 1,
			};
			const results = SheetUtils.applySheetAdjustments(
				sheet,
				overwriteSheetAdjustments,
				modifySheetAdjustments
			);
			expect(results.skills.lores).toEqual([
				{ name: 'kobold', bonus: 6, profMod: 2 },
				{ name: 'underground', bonus: 9, profMod: 4 },
				{ name: 'warfare', bonus: 3, profMod: 2 },
			]);
		});
		it('Applies attack modifiers to a sheet', () => {
			const sheet: Sheet = _.cloneDeep(SheetUtils.defaultSheet);
			sheet.attacks = [
				{
					name: 'bite',
					toHit: 1,
					traits: ['agile', 'finesse', 'reach', 'unarmed'],
					actions: ['one'],
					proficiency: 'expert',
					damage: [],
					notes: 'foo',
				},
				{
					name: 'claw',
					toHit: 3,
					traits: ['agile', 'finesse', 'reach', 'unarmed'],
					actions: ['one'],
					proficiency: 'expert',
					damage: [],
					notes: 'foo',
				},
			];
			const overwriteSheetAdjustments: untypedAdjustment = {};
			const modifySheetAdjustments: untypedAdjustment = {
				attack: 2,
			};
			const results = SheetUtils.applySheetAdjustments(
				sheet,
				overwriteSheetAdjustments,
				modifySheetAdjustments
			);
			expect(results.attacks).toEqual([
				{
					name: 'bite',
					toHit: 3,
					traits: ['agile', 'finesse', 'reach', 'unarmed'],
					actions: ['one'],
					proficiency: 'expert',
					damage: [],
					notes: 'foo',
				},
				{
					name: 'claw',
					toHit: 5,
					traits: ['agile', 'finesse', 'reach', 'unarmed'],
					actions: ['one'],
					proficiency: 'expert',
					damage: [],
					notes: 'foo',
				},
			]);
		});
		it('Applies weakness, resistance, and immunity modifiers to a sheet', () => {
			const sheet: Sheet = _.cloneDeep(SheetUtils.defaultSheet);
			sheet.defenses = {
				resistances: [{ name: 'fire', amount: 5 }],
				immunities: ['poison', 'bleed'],
				weaknesses: [{ name: 'cold', amount: 10 }],
				ac: 14,
			};
			const overwriteSheetAdjustments: untypedAdjustment = {
				'fire resistance': 2,
				'cold weakness': 5,
				'acid weakness': 5,
			};
			const modifySheetAdjustments: untypedAdjustment = {
				'fire resistance': 1,
				'cold weakness': 2,
				'lightning resistance': 3,
				'poison immunity': 'no',
				'disease immunity': 'yes',
			};
			const results = SheetUtils.applySheetAdjustments(
				sheet,
				overwriteSheetAdjustments,
				modifySheetAdjustments
			);
			expect(results.defenses.resistances).toEqual([
				{ name: 'fire', amount: 3 },
				{ name: 'lightning', amount: 3 },
			]);
			expect(results.defenses.immunities).toEqual(['bleed', 'disease']);
			expect(results.defenses.weaknesses).toEqual([
				{ name: 'cold', amount: 7 },
				{ name: 'acid', amount: 5 },
			]);
		});
		it('Applies sense and language modifiers to a sheet', () => {
			const sheet: Sheet = _.cloneDeep(SheetUtils.defaultSheet);
			sheet.general = {
				senses: ['low light vision', 'tremorsense'],
				languages: ['common'],
			};
			const overwriteSheetAdjustments: untypedAdjustment = {
				'darkvision sense': 2,
				'low light vision sense': 'no',
				'common language': 'no',
				'elven language': 'yes',
			};
			const modifySheetAdjustments: untypedAdjustment = {
				'draconic language': 1,
				'dwarven language': -1,
			};
			const results = SheetUtils.applySheetAdjustments(
				sheet,
				overwriteSheetAdjustments,
				modifySheetAdjustments
			);
			expect(results.general.senses).toEqual(['tremorsense', 'darkvision']);
			expect(results.general.languages).toEqual(['elven', 'draconic']);
		});
	});
});
