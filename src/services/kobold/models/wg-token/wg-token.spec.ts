import Ajv from 'ajv';
import { WgTokenFactory } from './wg-token.factory.js';
import { WgToken } from './wg-token.model.js';
import WgTokenSchema from './wg-token.schema.json' assert { type: 'json' };
import addFormats from 'ajv-formats';
console.log('here 1');
const ajv = new Ajv();
addFormats(ajv);
console.log('here 2');

describe('WG Token', () => {
	console.log('here 3');
	test('validates a built factory (after adding an id)', () => {
		console.log('here 4');
		const builtToken = WgTokenFactory.build();
		const valid = ajv.validate(WgTokenSchema, builtToken);
		expect(valid).toBe(true);
	});
	test('validates a created factory object', async () => {
		const createdToken = await WgTokenFactory.create();
		const valid = ajv.validate(WgTokenSchema, createdToken);
		expect(valid).toBe(true);
	});
	test('builds a token with a fake id', async () => {
		const builtToken = WgTokenFactory.withFakeId().build();
		expect(builtToken).toHaveProperty('id');
	});
	test('Model successfully inserts and retrieves a created token', async () => {
		const builtToken = WgTokenFactory.build();
		await WgToken.query().insert(builtToken);
		const fetchedTokens = await WgToken.query();
		const insertedToken = fetchedTokens.find(token => token.charId === builtToken.charId);
		expect(insertedToken.charId).toBe(builtToken.charId);
	});
});
