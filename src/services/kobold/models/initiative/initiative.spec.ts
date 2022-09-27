import Ajv from 'ajv';
import { InitiativeFactory } from './initiative.factory.js';
import { Initiative } from './initiative.model.js';
import InitiativeSchema from './initiative.schema.json';
import addFormats from 'ajv-formats';
const ajv = new Ajv({ allowUnionTypes: true });
addFormats(ajv);

describe('Initiative', () => {
	test('validates a built factory', () => {
		const builtInitiative = InitiativeFactory.build();
		const valid = ajv.validate(InitiativeSchema, builtInitiative);
		expect(valid).toBe(true);
	});
	test('validates a created factory object', async () => {
		const createdInitiative = await InitiativeFactory.create();
		const valid = ajv.validate(InitiativeSchema, createdInitiative);
		expect(valid).toBe(true);
	});
	test('builds a factory with a fake id', async () => {
		const builtInitiative = InitiativeFactory.withFakeId().build();
		expect(builtInitiative).toHaveProperty('id');
	});
	test('Model successfully inserts and retrieves a created factory', async () => {
		const builtInitiative = InitiativeFactory.build();
		await Initiative.query().insert(builtInitiative);
		const fetchedInitiatives = await Initiative.query();
		const insertedInitiative = fetchedInitiatives.find(
			factory => factory.charId === builtInitiative.charId
		);
		expect(insertedInitiative.charId).toBe(builtInitiative.charId);
	});
});
