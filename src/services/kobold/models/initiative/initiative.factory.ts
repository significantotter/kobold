import { Factory } from 'fishery';
import type { DeepPartial } from 'fishery';
import { InitiativeModel } from './initiative.model.js';
import { faker } from '@faker-js/faker';

type InitiativeTransientParams = {};

class InitiativeFactoryClass extends Factory<
	InitiativeModel,
	InitiativeTransientParams,
	InitiativeModel
> {
	withFakeId() {
		return this.params({
			id: faker.number.int(2147483647),
		});
	}
}

export const InitiativeFactory = InitiativeFactoryClass.define(({ onCreate }) => {
	onCreate(async builtInitiative => InitiativeModel.query().insert(builtInitiative));

	const initiativeData: DeepPartial<InitiativeModel> = {
		channelId: faker.string.uuid(),
		gmUserId: faker.string.uuid(),
		currentRound: faker.number.int(11),
		currentTurnGroupId: null,
		createdAt: faker.date.recent({ days: 30 }).toISOString(),
		lastUpdatedAt: faker.date.recent({ days: 30 }).toISOString(),
	};

	return InitiativeModel.fromDatabaseJson(initiativeData);
});
