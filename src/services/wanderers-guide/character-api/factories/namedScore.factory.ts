import { Factory } from 'fishery';
import type { DeepPartial } from 'fishery';
import type { WG } from '../../wanderers-guide.js';
import { faker } from '@faker-js/faker';

type NamedScoreTransientParams = {};

class NamedScoreFactoryClass extends Factory<
	WG.NamedScore,
	NamedScoreTransientParams,
	WG.NamedScore
> {}

export const NamedScoreFactory = NamedScoreFactoryClass.define(() => ({
	Name: faker.word.words(1),
	Score: faker.number.int({ min: -2, max: 30 }),
}));
