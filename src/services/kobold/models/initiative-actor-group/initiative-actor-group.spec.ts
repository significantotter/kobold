import { InitiativeFactory } from './../initiative/initiative.factory.js';
import Ajv from 'ajv';
import { InitiativeActorGroupFactory } from './initiative-actor-group.factory.js';
import { InitiativeActorGroup } from './initiative-actor-group.model.js';
import InitiativeActorGroupSchema from './initiative-actor-group.schema.json' assert { type: 'json' };
import addFormats from 'ajv-formats';
const ajv = new Ajv.default({ allowUnionTypes: true });
addFormats.default(ajv);

describe('Initiative Actor', () => {
	test('validates a built factory', () => {
		const builtActorGroup = InitiativeActorGroupFactory.build();
		const valid = ajv.validate(InitiativeActorGroupSchema, builtActorGroup);
		expect(valid).toBe(true);
	});
	test('validates a created factory object', async () => {
		const createdActor = await InitiativeActorGroupFactory.create();
		const valid = ajv.validate(InitiativeActorGroupSchema, createdActor);
		expect(valid).toBe(true);
	});
	test('builds a factory with a fake id', async () => {
		const builtActorGroup = InitiativeActorGroupFactory.withFakeId().build();
		expect(builtActorGroup).toHaveProperty('id');
	});
	test('Model successfully inserts and retrieves a created factory', async () => {
		const builtActorGroup = InitiativeActorGroupFactory.build();
		const initiative = await InitiativeFactory.create();
		await InitiativeActorGroup.query().insert({
			...builtActorGroup,
			initiativeId: initiative.id,
		});
		const fetchedActors = await InitiativeActorGroup.query();
		const insertedActor = fetchedActors.find(
			factory => factory.charId === builtActorGroup.charId
		);
		expect(insertedActor.charId).toBe(builtActorGroup.charId);
	});
});
