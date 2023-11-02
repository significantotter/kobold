import { WgTokenFactory } from './wg-token.factory.js';
import { WgTokenModel } from './wg-token.model.js';
import { zWgToken } from '../../schemas/wg-token.zod.js';

describe('WG Token', () => {
	test('validates a built factory', () => {
		const builtToken = WgTokenFactory.build();
		const valid = zWgToken.omit({ id: true }).safeParse(builtToken.toJSON());
		expect(valid.success).toBe(true);
	});
	test('validates a created factory object', async () => {
		const createdToken = await WgTokenFactory.create();
		const valid = zWgToken.safeParse(createdToken.toJSON());
		expect(valid.success).toBe(true);
	});
	test('builds a token with a fake id', async () => {
		const builtToken = WgTokenFactory.withFakeId().build();
		expect(builtToken).toHaveProperty('id');
	});
	test('Model successfully inserts and retrieves a created token', async () => {
		const builtToken = WgTokenFactory.build();
		await WgTokenModel.query().insert(builtToken);
		const fetchedTokens = await WgTokenModel.query();
		const insertedToken = fetchedTokens.find(token => token.charId === builtToken.charId);
		expect(insertedToken?.charId).toBe(builtToken.charId);
	});
});
