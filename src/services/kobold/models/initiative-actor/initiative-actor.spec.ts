import { InitiativeActorGroupFactory } from './../initiative-actor-group/initiative-actor-group.factory.js';
import Ajv from 'ajv';
import { InitiativeActorFactory } from './initiative-actor.factory.js';
import { InitiativeActorModel } from './initiative-actor.model.js';
import addFormats from 'ajv-formats';
import { zInitiativeActor } from '../../schemas/initiative-actor.zod.js';

describe('Initiative Actor', () => {
	test('validates a built factory', () => {
		const builtActor = InitiativeActorFactory.build();
		const valid = zInitiativeActor.safeParse(builtActor);
		expect(valid.success).toBe(true);
	});
	test('validates a created factory object', async () => {
		const createdActor = await InitiativeActorFactory.create();
		const valid = zInitiativeActor.safeParse(createdActor);
		expect(valid.success).toBe(true);
	});
	test('builds a factory with a fake id', async () => {
		const builtActor = InitiativeActorFactory.withFakeId().build();
		expect(builtActor).toHaveProperty('id');
	});
	test('Model successfully inserts and retrieves a created factory', async () => {
		const builtActor = InitiativeActorFactory.build();
		const initiativeActorGroup = await InitiativeActorGroupFactory.create();
		await InitiativeActorModel.query().insert({
			...builtActor,
			initiativeActorGroupId: initiativeActorGroup.id,
			initiativeId: initiativeActorGroup.initiativeId,
		});
		const fetchedActors = await InitiativeActorModel.query();
		const insertedActor = fetchedActors.find(factory => factory.charId === builtActor.charId);
		expect(insertedActor?.charId).toBe(builtActor.charId);
	});
});
