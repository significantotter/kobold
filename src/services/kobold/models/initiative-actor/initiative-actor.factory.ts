import { InitiativeFactory } from './../initiative/initiative.factory';
import { Factory } from 'fishery';
import type { DeepPartial } from 'fishery';
import { InitiativeActor } from './initiative-actor.model.js';
import { faker } from '@faker-js/faker';
import { InitiativeActorGroupFactory } from '../initiative-actor-group/initiative-actor-group.factory.js';

type InitiativeActorTransientParams = {};

class InitiativeActorFactoryClass extends Factory<
	InitiativeActor,
	InitiativeActorTransientParams,
	InitiativeActor
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

export const InitiativeActorFactory = InitiativeActorFactoryClass.define(({ onCreate }) => {
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

	const actorData: DeepPartial<InitiativeActor> = {
		userId: faker.datatype.uuid(),
		name: faker.name.firstName(),
		createdAt: faker.date.recent(30).toISOString(),
		lastUpdatedAt: faker.date.recent(30).toISOString(),
	};

	return InitiativeActor.fromDatabaseJson(actorData);
});
