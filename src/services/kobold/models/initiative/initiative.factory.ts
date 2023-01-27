import { Factory } from 'fishery';
import type { DeepPartial } from 'fishery';
import { Initiative } from './initiative.model.js';
import { faker } from '@faker-js/faker';

type InitiativeTransientParams = {};

class InitiativeFactoryClass extends Factory<Initiative, InitiativeTransientParams, Initiative> {
	withFakeId() {
		return this.params({
			id: faker.datatype.number(),
		});
	}
}

export const InitiativeFactory = InitiativeFactoryClass.define(({ onCreate }) => {
	onCreate(async builtInitiative => Initiative.query().insert(builtInitiative));

	const initiativeData: DeepPartial<Initiative> = {
		channelId: faker.datatype.uuid(),
		gmUserId: faker.datatype.uuid(),
		roundMessageIds: [],
		currentRound: faker.datatype.number(11),
		currentTurnGroupId: null,
		createdAt: faker.date.recent(30).toISOString(),
		lastUpdatedAt: faker.date.recent(30).toISOString(),
	};

	return Initiative.fromDatabaseJson(initiativeData);
});
