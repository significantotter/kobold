import { Factory } from 'fishery';
import type { DeepPartial } from 'fishery';
import type { WG } from '../wanderers-guide.js';
import { faker } from '@faker-js/faker';

type NamedBonusTransientParams = {};

class NamedBonusFactoryClass extends Factory<
	WG.NamedBonus,
	NamedBonusTransientParams,
	WG.NamedBonus
> {}

export const NamedBonusFactory = NamedBonusFactoryClass.define(() => ({
	Name: faker.random.words(1),
	Bonus: faker.datatype.number({ min: -2, max: 30 }),
}));
