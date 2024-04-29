import { AbilityEnum } from '@kobold/db';
import { AttributeUtils } from './attribute-utils.js';
import { Creature } from './creature.js';
import { SheetProperties } from './sheet/sheet-properties.js';

const sheet = SheetProperties.defaultSheet;
sheet.stats.acrobatics = { ...sheet.stats.acrobatics, bonus: 9, dc: 19, proficiency: 2 };
sheet.intProperties.walkSpeed = 25;
sheet.intProperties.martialProficiency = 2;
sheet.intProperties.dexterity = 4;
sheet.intProperties.strength = 2;
sheet.intProperties.constitution = 1;
sheet.intProperties.intelligence = 3;
sheet.intProperties.wisdom = 0;
sheet.intProperties.charisma = -1;

sheet.intProperties.unarmedProficiency = 1;
sheet.intProperties.simpleProficiency = 2;
sheet.intProperties.martialProficiency = 3;
sheet.intProperties.advancedProficiency = 4;
sheet.intProperties.unarmoredProficiency = 5;
sheet.intProperties.lightProficiency = 6;
sheet.intProperties.mediumProficiency = 7;
sheet.intProperties.heavyProficiency = 8;

sheet.baseCounters.hp = {
	...sheet.baseCounters.hp,
	current: 10,
	max: 20,
};
sheet.additionalSkills.push({
	name: 'kobold lore',
	bonus: 8,
	dc: 18,
	proficiency: 2,
	ability: AbilityEnum.intelligence,
	note: null,
});
sheet.staticInfo.level = 2;
sheet.weaknessesResistances.resistances.push({ type: 'fire', amount: 5 });
sheet.weaknessesResistances.weaknesses.push({ type: 'cold', amount: 5 });
const creature = new Creature({
	sheet,
	actions: [],
	rollMacros: [],
	modifiers: [],
	conditions: [],
});

describe('computedSheetProperties', () => {
	it('should correctly compute attributes for a given creature', () => {
		const result = AttributeUtils.computedSheetProperties(creature);

		expect(result.find(attr => attr.name === 'unarmed')).toEqual(
			// Check a few representative attributes
			{
				name: 'unarmed',
				aliases: [
					'unarmed',
					'unarmedweapon',
					'unarmedattack',
					'unarmedproficiency',
					'unarmedprof',
					'unarmedprofmod',
					'unarmedweaponprof',
					'unarmedattackprof',
					'unarmedweaponprofmod',
					'unarmedattackprofmod',
					'unarmedweaponproficiency',
					'unarmedattackproficiency',
				],
				type: 'attack',
				value: 3, // level + unarmedProficiency
				tags: [],
			}
		);
		expect(result.find(attr => attr.name === 'light')).toEqual({
			name: 'light',
			aliases: [
				'light',
				'lightarmor',
				'lightdefense',
				'lightproficiency',
				'lightarmorprof',
				'lightdefenseprof',
				'lightarmorproficiency',
				'lightdefenseproficiency',
			],
			type: 'armor',
			value: 8, // level + lightProficiency
			tags: [],
		});
		expect(result.find(attr => attr.name === 'expert')).toEqual({
			name: 'expert',
			aliases: ['expert', 'experttotal', 'expertbonus', 'expertmod', 'expertmodifier'],
			type: 'proficiency',
			value: 6, // level + expert proficiency
			tags: [],
		});
	});
});
describe('getAttributeByName', () => {
	it('should return the correct attribute when given a valid stat', () => {
		const result = AttributeUtils.getAttributeByName(creature, 'acrobatics');
		expect(result).toMatchObject({ name: 'acrobaticsBonus', value: 9 });
	});
	it('should return the correct attribute when given a valid intProperty', () => {
		const result = AttributeUtils.getAttributeByName(creature, 'walk speed');
		expect(result).toMatchObject({ name: 'walkSpeed', value: 25 });
	});
	it('should return the correct attribute when given a valid baseCounter property', () => {
		let result = AttributeUtils.getAttributeByName(creature, 'max hp');
		expect(result).toMatchObject({ name: 'maxHp', value: 20 });
		result = AttributeUtils.getAttributeByName(creature, 'current hp');
		expect(result).toMatchObject({ name: 'currentHp', value: 10 });
	});
	it('should return the correct attribute when given a valid additionalSkill property', () => {
		let result = AttributeUtils.getAttributeByName(creature, 'koboldLore');
		expect(result).toMatchObject({ name: 'kobold lore', value: 8 });
	});
	it('should return the correct attribute when given a valid resistance property', () => {
		let result = AttributeUtils.getAttributeByName(creature, 'fireResistance');
		expect(result).toMatchObject({ name: 'fire resistance', value: 5 });
	});
	it('should return the correct attribute when given a valid weakness property', () => {
		let result = AttributeUtils.getAttributeByName(creature, 'coldWeakness');
		expect(result).toMatchObject({ name: 'cold weakness', value: 5 });
	});
	it('should return the correct attribute when asked for the level', () => {
		let result = AttributeUtils.getAttributeByName(creature, 'level');
		expect(result).toMatchObject({ name: 'level', value: 2 });
	});
	it('should return the correct attribute when asked for a computed property', () => {
		let result = AttributeUtils.getAttributeByName(creature, 'martial');
		expect(result).toMatchObject({ name: 'martial', value: 5 });
	});

	it('should return null when given an invalid name', () => {
		const result = AttributeUtils.getAttributeByName(creature, 'invalid name');
		expect(result).toBeNull();
	});
	it('should return null when given an invalid lore', () => {
		const result = AttributeUtils.getAttributeByName(creature, 'invalid lore');
		expect(result).toBeNull();
	});
});
