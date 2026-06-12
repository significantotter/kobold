import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import {
	createRequestIdentity,
	getOrCreateRequestIdentity,
	type WebEnv,
} from './request-identity.js';

describe('request identity', () => {
	it('creates a simple session ID cookie and reuses it', async () => {
		const app = new Hono<WebEnv>();
		app.get('/', c => c.json(getOrCreateRequestIdentity(c)));

		const firstResponse = await app.request('/');
		const firstIdentity = await firstResponse.json();
		const setCookie = firstResponse.headers.get('set-cookie');

		expect(firstIdentity).toEqual({
			sessionId: expect.stringMatching(/^[a-f0-9]{12}$/),
			actor: firstIdentity.sessionId,
			discordName: null,
			userId: null,
		});
		expect(setCookie).toContain(`kobold_session_id=${firstIdentity.sessionId}`);

		const secondResponse = await app.request('/', {
			headers: {
				cookie: `kobold_session_id=${firstIdentity.sessionId}`,
			},
		});

		expect(await secondResponse.json()).toEqual(firstIdentity);
		expect(secondResponse.headers.get('set-cookie')).toBeNull();
	});

	it('uses the Discord display name as the actor when authenticated', () => {
		expect(
			createRequestIdentity('abcdef123456', {
				userId: 'discord-user-id',
				username: 'discord_username',
				displayName: 'Discord Name',
				discriminator: '0',
				avatar: null,
				exp: Date.now() + 60_000,
			})
		).toEqual({
			sessionId: 'abcdef123456',
			actor: 'Discord Name',
			discordName: 'Discord Name',
			userId: 'discord-user-id',
		});
	});
});
