import { Factory } from 'fishery';
import type { DeepPartial } from 'fishery';
import type { WG } from '../../wanderers-guide.js';
import { faker } from '@faker-js/faker';

type AttackTransientParams = {};

class AttackFactoryClass extends Factory<WG.Attack, AttackTransientParams, WG.Attack> {}

const diceSizes = [2, 4, 6, 8, 10, 12];

const damageTypes = [
	'b',
	'p',
	's',
	'fire',
	'cold',
	'acid',
	'electricity',
	'sonic',
	'positive',
	'negative',
	'force',
	'good',
	'evil',
	'chaotic',
	'lawful',
	'mental',
	'poison',
	'bleed',
	'nonlethal',
	'precision',
];

export const AttackFactory = AttackFactoryClass.define(() => ({
	Name: faker.word.words(1),
	Bonus: faker.number.int({ min: -2, max: 30 }),
	Damage: `${faker.number.int({ min: 1, max: 10 })}d${faker.helpers.arrayElement(
		diceSizes
	)} ${faker.helpers.arrayElement(damageTypes)}`,
}));
