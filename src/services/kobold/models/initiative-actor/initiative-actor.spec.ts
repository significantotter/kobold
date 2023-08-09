import { InitiativeActorGroupFactory } from './../initiative-actor-group/initiative-actor-group.factory.js';
import Ajv from 'ajv';
import { InitiativeActorFactory } from './initiative-actor.factory.js';
import { InitiativeActor } from './initiative-actor.model.js';
import InitiativeActorSchema from './initiative-actor.schema.json' assert { type: 'json' };
import addFormats from 'ajv-formats';
const ajv = new Ajv.default({ allowUnionTypes: true });
addFormats.default(ajv);

describe('Initiative Actor', () => {
	test('validates a built factory', () => {
		const builtActor = InitiativeActorFactory.build();
		const valid = ajv.validate(InitiativeActorSchema, builtActor);
		expect(valid).toBe(true);
	});
	test('validates a created factory object', async () => {
		const createdActor = await InitiativeActorFactory.create();
		const valid = ajv.validate(InitiativeActorSchema, createdActor);
		expect(valid).toBe(true);
	});
	test('builds a factory with a fake id', async () => {
		const builtActor = InitiativeActorFactory.withFakeId().build();
		expect(builtActor).toHaveProperty('id');
	});
	test('Model successfully inserts and retrieves a created factory', async () => {
		const builtActor = InitiativeActorFactory.build();
		const initiativeActorGroup = await InitiativeActorGroupFactory.create();
		await InitiativeActor.query().insert({
			...builtActor,
			initiativeActorGroupId: initiativeActorGroup.id,
			initiativeId: initiativeActorGroup.initiativeId,
		});
		const fetchedActors = await InitiativeActor.query();
		const insertedActor = fetchedActors.find(factory => factory.charId === builtActor.charId);
		expect(insertedActor.charId).toBe(builtActor.charId);
	});
});
