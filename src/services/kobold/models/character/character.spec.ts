import Ajv from 'ajv';
import { CharacterFactory } from './character.factory.js';
import { Character } from './character.model.js';
import CharacterSchema from './character.schema.json';
import addFormats from 'ajv-formats';
const ajv = new Ajv();
addFormats(ajv);

describe('WG Token', () => {
	test('validates a built factory', () => {
		const builtToken = CharacterFactory.build();
		const valid = ajv.validate(CharacterSchema, builtToken);
		expect(valid).toBe(true);
	});
	test('validates a created factory object', async () => {
		const createdToken = await CharacterFactory.create();
		const valid = ajv.validate(CharacterSchema, createdToken);
		expect(valid).toBe(true);
	});
	test('builds a token with a fake id', async () => {
		const builtToken = CharacterFactory.withFakeId().build();
		expect(builtToken).toHaveProperty('id');
	});
	test('Model successfully inserts and retrieves a created token', async () => {
		const builtToken = CharacterFactory.build();
		await Character.query().insert(builtToken);
		const fetchedTokens = await Character.query();
		const insertedToken = fetchedTokens.find(token => token.charId === builtToken.charId);
		expect(insertedToken.charId).toBe(builtToken.charId);
	});
});
