import { Language } from '../models/enum-helpers/language.js';
import { CharacterFactory } from './../services/kobold/models/character/character.factory';
import { RollBuilder, DiceUtils } from './dice-utils';
describe('Dice Utils', function () {
	describe('buildDiceExpression', function () {
		test('builds a dice expression using a base expression, a bonus, and a modifier', function () {
			const result = DiceUtils.buildDiceExpression('d10', '5', '2d4');
			expect(result).toBe('d10+5+(2d4)');
		});
		test('handles negative bonuses and modifiers properly', function () {
			const result = DiceUtils.buildDiceExpression('d10', '-5', '-2d4');
			expect(result).toBe('d10-5+(-2d4)');
		});
		test('Allows a bonus or modifier to have a + symbol without inputting ++', function () {
			const result = DiceUtils.buildDiceExpression('d10', '+5', '+2d4');
			expect(result).toBe('d10+5+(+2d4)');
		});
		test('allows for base dice with no modifier', function () {
			const result = DiceUtils.buildDiceExpression('d10', '5');
			expect(result).toBe('d10+5');
		});
		test('allows for base dice with no bonus', function () {
			const result = DiceUtils.buildDiceExpression('d10', null, '2d4');
			expect(result).toBe('d10+(2d4)');
		});
		test('allows for just base dice', function () {
			const result = DiceUtils.buildDiceExpression('d10');
			expect(result).toBe('d10');
		});
		test('defaults a lack of base dice to d20', function () {
			const result = DiceUtils.buildDiceExpression(null, '+5');
			expect(result).toBe('d20+5');
		});
	});
	describe('parseDiceFromWgDamageField', function () {
		test('removes valid damage type from the end of a dice expression', function () {
			const dice = DiceUtils.parseDiceFromWgDamageField('d20 - 5 electric');
			expect(dice).toBe('d20 - 5');
			const otherDice = DiceUtils.parseDiceFromWgDamageField(
				'{( 2 / 5 )d20kl...10} >= 14 fire or mental'
			);
			expect(otherDice).toBe('{( 2 / 5 )d20kl...10} >= 14');
		});
		test(`doesn't remove test that might be in the middle of a roll expression`, function () {
			const dice = DiceUtils.parseDiceFromWgDamageField('d20 - 5 electric + 5');
			expect(dice).toBe('d20 - 5 electric + 5');
			const otherDice = DiceUtils.parseDiceFromWgDamageField(
				'{( 2 / 5 fire )d20kl...10} >= 14'
			);
			expect(otherDice).toBe('{( 2 / 5 fire )d20kl...10} >= 14');
		});
	});
});

describe('RollBuilder', function () {
	test('rolls dice without a character', function () {
		const rollBuilder = new RollBuilder({
			actorName: 'testname',
			character: null,
		});
		rollBuilder.addRoll({ rollExpression: 'd20+1', rollTitle: 'testRoll' });
		rollBuilder.addRoll({ rollExpression: 'd4+1', rollTitle: 'testRoll2' });
		const result = rollBuilder.compileEmbed();
		const diceField1 = result.data.fields.find(field => field.name === 'testRoll');
		const diceField2 = result.data.fields.find(field => field.name === 'testRoll2');
		expect(diceField1.value).toContain('d20+1');
		expect(diceField2.value).toContain('d4+1');
		expect(result.data.title.toLowerCase()).toContain('testname');
	});
	test(`making a single roll puts the roll value in the description and ignores the title`, function () {
		const rollBuilder = new RollBuilder({
			actorName: 'testname',
			character: null,
		});
		rollBuilder.addRoll({ rollExpression: 'd20+1', rollTitle: 'testRoll' });
		const result = rollBuilder.compileEmbed();
		const diceField = (result.data?.fields || []).find(field => field.name === 'testRoll');
		expect(result.data.title.toLowerCase()).toContain('testname');
		expect(result.data.title.toLowerCase()).not.toContain('testRoll');
		expect(result.data.description).toContain('d20+1');
		expect(diceField).toBeUndefined();
	});
	test(`when referencing a character, applies the character's name and image to the embed`, function () {
		const fakeCharacter = CharacterFactory.build();
		const rollBuilder = new RollBuilder({
			character: fakeCharacter,
		});
		rollBuilder.addRoll({ rollExpression: 'd6+1', rollTitle: 'testRoll' });
		const result = rollBuilder.compileEmbed();
		expect(result.data.title.toLowerCase()).toContain(
			fakeCharacter.characterData.name.toLowerCase()
		);
		expect(result.data.thumbnail.url).toBe(fakeCharacter.characterData?.infoJSON?.imageURL);
	});
	test(`allows a custom rollnote`, function () {
		const rollBuilder = new RollBuilder({
			rollNote: 'testing!',
		});
		rollBuilder.addRoll({ rollExpression: 'd6+1', rollTitle: 'testRoll' });
		const result = rollBuilder.compileEmbed();
		expect(result.data.footer.text).toBe('testing!\n\n');
	});
	test(`allows a title that will overwrite any otherwise generated title`, function () {
		const fakeCharacter = CharacterFactory.build();
		const rollBuilder = new RollBuilder({
			character: fakeCharacter,
			actorName: 'some actor',
			title: `an entirely different title`,
		});
		rollBuilder.addRoll({ rollExpression: 'd6+1', rollTitle: 'testRoll' });
		const result = rollBuilder.compileEmbed();
		expect(result.data.title.toLowerCase()).not.toContain(fakeCharacter.characterData.name);
		expect(result.data.title.toLowerCase()).not.toContain('some actor');
		expect(result.data.title.toLowerCase()).toBe(`an entirely different title`);
	});
	test('records errors if something causes a thrown error', function () {
		const rollBuilder = new RollBuilder({});
		rollBuilder.addRoll({ rollExpression: 'd10', rollTitle: 'testRoll' });
		//temporarily disable the console for the error test
		const temp = console.warn;
		console.warn = (...args) => {};
		rollBuilder.addRoll({ rollExpression: 'dd6++1', rollTitle: 'errorRoll' });
		console.warn = temp;
		const result = rollBuilder.compileEmbed();
		const errorRollField = result.data.fields.find(field => field.name === 'errorRoll');
		expect(errorRollField.value).toContain(
			Language.LL.utils.dice.diceRollError({ rollExpression: 'dd6++1' })
		);
	});
	test('records errors if the dice expression is not allowed', function () {
		const rollBuilder = new RollBuilder({});
		rollBuilder.addRoll({ rollExpression: 'd10', rollTitle: 'testRoll' });
		rollBuilder.addRoll({ rollExpression: '500d6', rollTitle: 'errorRoll' });
		const result = rollBuilder.compileEmbed();
		const errorRollField = result.data.fields.find(field => field.name === 'errorRoll');
		expect(errorRollField.value).toContain(
			Language.LL.utils.dice
				.diceRollError({
					rollExpression: '',
				})
				.substring(0, -2)
		);
	});
	test('parses an attribute', function () {
		const character = CharacterFactory.build({
			attributes: [
				{
					name: 'test',
					type: 'base',
					value: 7,
					tags: [],
				},
			],
			customAttributes: [],
		});
		const rollBuilder = new RollBuilder({ character });
		expect(DiceUtils.parseAttribute('[test]')).toStrictEqual([7, []]);
	});
	test('parses a custom attribute', function () {
		const character = CharacterFactory.build({
			customAttributes: [
				{
					name: 'custom',
					type: 'base',
					value: 3,
					tags: ['a', 'b', 'c'],
				},
			],
			attributes: [],
		});
		const rollBuilder = new RollBuilder({ character });
		expect(DiceUtils.parseAttribute('[custom]')).toStrictEqual([3, ['a', 'b', 'c']]);
	});
	test('parses custom over base when multiple attributes are present', function () {
		const character = CharacterFactory.build({
			attributes: [
				{
					name: 'same',
					type: 'base',
					value: 8,
					tags: ['asdf', 'qwer'],
				},
			],
			customAttributes: [
				{
					name: 'same',
					type: 'base',
					value: 4,
					tags: [],
				},
			],
		});
		const rollBuilder = new RollBuilder({ character });
		expect(DiceUtils.parseAttribute('[same]')).toStrictEqual([4, []]);
	});
	test('fails to parse an invalid attribute', function () {
		const rollBuilder = new RollBuilder({});
		expect(() => DiceUtils.parseAttribute('[same]')).toThrowError();
	});
	test('parses an attribute using a shorthand value', function () {
		const character = CharacterFactory.build({
			attributes: [
				{
					name: 'strength',
					type: 'base',
					value: 11,
					tags: ['ability', 'strength'],
				},
			],
			customAttributes: [],
		});
		const rollBuilder = new RollBuilder({ character });
		expect(DiceUtils.parseAttribute('[str]')).toStrictEqual([11, ['ability', 'strength']]);
	});
	test('parses all attributes in a dice expression', function () {
		const character = CharacterFactory.build({
			attributes: [
				{
					name: 'base',
					type: 'base',
					value: 8,
					tags: [],
				},
			],
			customAttributes: [
				{
					name: 'custom',
					type: 'base',
					value: 4,
					tags: [],
				},
			],
		});
		const rollBuilder = new RollBuilder({ character });
		expect(DiceUtils.parseAttributes('[custom]d20 + [base] - [custom]')).toStrictEqual([
			'4d20 + 8 - 4',
			[],
		]);
	});
	test('rolls dice using parsed character attributes', function () {
		const character = CharacterFactory.build({
			attributes: [
				{
					name: 'base',
					type: 'base',
					value: 8,
					tags: [],
				},
			],
			customAttributes: [
				{
					name: 'custom',
					type: 'base',
					value: 4,
					tags: [],
				},
			],
		});
		const rollBuilder = new RollBuilder({ character });
		rollBuilder.addRoll({
			rollExpression: '[custom]d20 + [base] - [custom]',
			rollTitle: 'attribute roll',
		});
		expect(rollBuilder.getRollTotalArray()?.length).toBeTruthy();
	});
});
