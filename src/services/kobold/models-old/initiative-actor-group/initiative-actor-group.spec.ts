import { InitiativeFactory } from '../initiative/initiative.factory.js';
import Ajv from 'ajv';
import { InitiativeActorGroupFactory } from './initiative-actor-group.factory.js';
import { InitiativeActorGroupModel } from './initiative-actor-group.model.js';
import addFormats from 'ajv-formats';
import { zInitiativeActorGroup } from '../../schemas/zod-tables/initiative-actor-group.zod.js';

describe('Initiative Actor', () => {
	test('validates a built factory', () => {
		const builtActorGroup = InitiativeActorGroupFactory.build();
		const valid = zInitiativeActorGroup.safeParse(builtActorGroup);
		expect(valid.success).toBe(true);
	});
	test('validates a created factory object', async () => {
		const createdActor = await InitiativeActorGroupFactory.create();
		const valid = zInitiativeActorGroup.safeParse(createdActor);
		expect(valid.success).toBe(true);
	});
	test('builds a factory with a fake id', async () => {
		const builtActorGroup = InitiativeActorGroupFactory.withFakeId().build();
		expect(builtActorGroup).toHaveProperty('id');
	});
	test('Model successfully inserts and retrieves a created factory', async () => {
		const builtActorGroup = InitiativeActorGroupFactory.build();
		const initiative = await InitiativeFactory.create();
		await InitiativeActorGroupModel.query().insert({
			...builtActorGroup,
			initiativeId: initiative.id,
		});
		const fetchedActors = await InitiativeActorGroupModel.query();
		const insertedActor = fetchedActors.find(
			factory => factory.charId === builtActorGroup.charId
		);
		expect(insertedActor?.charId).toBe(builtActorGroup.charId);
	});
});
