import { InitiativeFactory } from '../initiative/initiative.factory.js';
import { Factory } from 'fishery';
import type { DeepPartial } from 'fishery';
import { InitiativeActorGroupModel } from './initiative-actor-group.model.js';
import { faker } from '@faker-js/faker';

type InitiativeActorGroupTransientParams = {};

class InitiativeActorGroupFactoryClass extends Factory<
	InitiativeActorGroupModel,
	InitiativeActorGroupTransientParams,
	InitiativeActorGroupModel
> {
	withFakeId() {
		return this.params({
			id: faker.number.int(2147483647),
		});
	}
	withFakeInitiativeId() {
		return this.params({
			initiativeId: faker.number.int(2147483647),
		});
	}
}

export const InitiativeActorGroupFactory = InitiativeActorGroupFactoryClass.define(
	({ onCreate }) => {
		onCreate(async builtInitiativeActorGroup => {
			return InitiativeActorGroupModel.query().insertGraph({
				...builtInitiativeActorGroup,
				initiative: InitiativeFactory.build(),
			});
		});

		const actorGroupData: DeepPartial<InitiativeActorGroupModel> = {
			userId: faker.string.uuid(),
			name: faker.person.firstName(),
			initiativeResult: faker.number.int(40),
			createdAt: faker.date.recent({ days: 30 }).toISOString(),
			lastUpdatedAt: faker.date.recent({ days: 30 }).toISOString(),
		};

		return InitiativeActorGroupModel.fromDatabaseJson(actorGroupData);
	}
);
