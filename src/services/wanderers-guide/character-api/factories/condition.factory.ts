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
	conditionID: faker.datatype.number({ max: 999 }),
	name: faker.random.words(1),
	entryID: faker.datatype.number({ max: 999 }),
	parentEntryID: faker.datatype.number({ max: 999 }),
	sourceText: faker.random.words(5),
	value: faker.datatype.number({ max: 30 }),
}));
