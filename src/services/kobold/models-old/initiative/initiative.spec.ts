import Ajv from 'ajv';
import { InitiativeFactory } from './initiative.factory.js';
import { InitiativeModel } from './initiative.model.js';
import addFormats from 'ajv-formats';
import { zInitiative } from '../../schemas/zod-tables/initiative.zod.js';

describe('Initiative', () => {
	test('validates a built factory', () => {
		const builtInitiative = InitiativeFactory.build();
		const valid = zInitiative.safeParse(builtInitiative.toJSON());
		expect(valid.success).toBe(true);
	});
	test('validates a created factory object', async () => {
		const createdInitiative = await InitiativeFactory.create();
		const valid = zInitiative.safeParse(createdInitiative.toJSON());
		expect(valid.success).toBe(true);
	});
	test('builds a factory with a fake id', async () => {
		const builtInitiative = InitiativeFactory.withFakeId().build();
		expect(builtInitiative).toHaveProperty('id');
	});
	test('Model successfully inserts and retrieves a created factory', async () => {
		const builtInitiative = InitiativeFactory.build();
		await InitiativeModel.query().insert(builtInitiative);
		const fetchedInitiatives = await InitiativeModel.query();
		const insertedInitiative = fetchedInitiatives.find(
			factory => factory.charId === builtInitiative.charId
		);
		expect(insertedInitiative?.charId).toBe(builtInitiative.charId);
	});
});
