import { InitiativeFactory } from './../initiative/initiative.factory.js';
import { Factory } from 'fishery';
import type { DeepPartial } from 'fishery';
import { InitiativeActorModel } from './initiative-actor.model.js';
import { faker } from '@faker-js/faker';
import { InitiativeActorGroupFactory } from '../initiative-actor-group/initiative-actor-group.factory.js';

type InitiativeActorTransientParams = {
	includeGroup: boolean;
};

class InitiativeActorFactoryClass extends Factory<
	InitiativeActorModel,
	InitiativeActorTransientParams,
	InitiativeActorModel
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

export const InitiativeActorFactory = InitiativeActorFactoryClass.define(({ onCreate }) => {
	onCreate(async builtInitiativeActor => {
		return InitiativeActorModel.query().insertGraph(
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

	const actorData: DeepPartial<InitiativeActorModel> = {
		userId: faker.string.uuid(),
		name,
		hideStats: faker.datatype.boolean(),
		createdAt: faker.date.recent({ days: 30 }).toISOString(),
		lastUpdatedAt: faker.date.recent({ days: 30 }).toISOString(),
	};

	return InitiativeActorModel.fromDatabaseJson(actorData);
});
