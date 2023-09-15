import { InitiativeFactory } from './../initiative/initiative.factory.js';
import { Factory } from 'fishery';
import type { DeepPartial } from 'fishery';
import { InitiativeActor } from './initiative-actor.model.js';
import { faker } from '@faker-js/faker';
import { InitiativeActorGroupFactory } from '../initiative-actor-group/initiative-actor-group.factory.js';

type InitiativeActorTransientParams = {
	includeGroup: boolean;
};

class InitiativeActorFactoryClass extends Factory<
	InitiativeActor,
	InitiativeActorTransientParams,
	InitiativeActor
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

export const InitiativeActorFactory = InitiativeActorFactoryClass.define(
	({ onCreate, transientParams }) => {
		onCreate(async builtInitiativeActor => {
			return InitiativeActor.query().insertGraph(
				{
					...builtInitiativeActor,
					actorGroup: {
						...InitiativeActorGroupFactory.build({
							userId: builtInitiativeActor.userId,
							name: builtInitiativeActor.name,
						}),
						initiative: { '#ref': 'initiative' },
					},
					initiative: { '#id': 'initiative', ...InitiativeFactory.build() },
				},
				{ allowRefs: true }
			);
		});
		const name = faker.person.firstName();
		let actorGroup;
		if (transientParams.includeGroup) {
			actorGroup = InitiativeActorGroupFactory.withFakeId().build({ name });
		}

		const actorData: DeepPartial<InitiativeActor> = {
			userId: faker.string.uuid(),
			name,
			actorGroup,
			hideStats: faker.datatype.boolean(),
			initiativeActorGroupId: actorGroup?.id,
			createdAt: faker.date.recent({ days: 30 }).toISOString(),
			lastUpdatedAt: faker.date.recent({ days: 30 }).toISOString(),
		};

		return InitiativeActor.fromDatabaseJson(actorData);
	}
);
