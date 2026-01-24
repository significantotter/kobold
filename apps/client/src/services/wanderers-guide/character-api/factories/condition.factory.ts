import { Factory } from 'fishery';
import type { DeepPartial } from 'fishery';
import type { WG } from '../../wanderers-guide.js';
import { faker } from '@faker-js/faker';

type ConditionTransientParams = {};

class ConditionFactoryClass extends Factory<
	WG.CalculatedCondition,
	ConditionTransientParams,
	WG.CalculatedCondition
> {}

export const ConditionFactory = ConditionFactoryClass.define(() => ({
	conditionID: faker.number.int({ max: 999 }),
	name: faker.word.words(1),
	entryID: faker.number.int({ max: 999 }),
	parentEntryID: faker.number.int({ max: 999 }),
	sourceText: faker.word.words(5),
	value: faker.number.int({ max: 30 }),
}));
