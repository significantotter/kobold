import { InitiativeActorFactory } from './../initiative-actor/initiative-actor.factory.js';
import { InitiativeFactory } from './../initiative/initiative.factory.js';
import { Factory } from 'fishery';
import type { DeepPartial } from 'fishery';
import { InitiativeActorGroup } from './initiative-actor-group.model.js';
import { faker } from '@faker-js/faker';

type InitiativeActorGroupTransientParams = {};

class InitiativeActorGroupFactoryClass extends Factory<
	InitiativeActorGroup,
	InitiativeActorGroupTransientParams,
	InitiativeActorGroup
> {
	withFakeId() {
		return this.params({
			id: faker.datatype.number(),
		});
	}
	withFakeInitiativeId() {
		return this.params({
			initiativeId: faker.datatype.number(),
		});
	}
}

export const InitiativeActorGroupFactory = InitiativeActorGroupFactoryClass.define(
	({ onCreate }) => {
		onCreate(async builtInitiativeActorGroup => {
			return InitiativeActorGroup.query().insertGraph({
				...builtInitiativeActorGroup,
				initiative: InitiativeFactory.build(),
			});
		});

		const actorGroupData: DeepPartial<InitiativeActorGroup> = {
			userId: faker.datatype.uuid(),
			name: faker.name.firstName(),
			initiativeResult: faker.datatype.number(40),
			createdAt: faker.date.recent(30).toISOString(),
			lastUpdatedAt: faker.date.recent(30).toISOString(),
		};

		return InitiativeActorGroup.fromDatabaseJson(actorGroupData);
	}
);
