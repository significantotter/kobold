import { randomBytes } from 'node:crypto';
import type { Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import {
	verifySessionToken,
	type SessionPayload,
} from './session.js';

const SESSION_ID_COOKIE = 'kobold_session_id';
const SESSION_ID_PATTERN = /^[a-f0-9]{12}$/;
const SESSION_ID_MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

export interface RequestIdentity {
	sessionId: string;
	actor: string;
	discordName: string | null;
	userId: string | null;
}

export interface WebEnv {
	Variables: {
		requestIdentity: RequestIdentity;
	};
}

function createSessionId(): string {
	return randomBytes(6).toString('hex');
}

export function createRequestIdentity(
	sessionId: string,
	user: SessionPayload | null
): RequestIdentity {
	const discordName = user?.displayName ?? user?.username ?? null;

	return {
		sessionId,
		actor: discordName ?? sessionId,
		discordName,
		userId: user?.userId ?? null,
	};
}

export function getOrCreateRequestIdentity(c: Context): RequestIdentity {
	const cookieSessionId = getCookie(c, SESSION_ID_COOKIE);
	const sessionId =
		cookieSessionId && SESSION_ID_PATTERN.test(cookieSessionId)
			? cookieSessionId
			: createSessionId();

	if (sessionId !== cookieSessionId) {
		setCookie(c, SESSION_ID_COOKIE, sessionId, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'Lax',
			maxAge: SESSION_ID_MAX_AGE_SECONDS,
			path: '/',
		});
	}

	const authToken = getCookie(c, 'session');
	const user = authToken ? verifySessionToken(authToken) : null;
	return createRequestIdentity(sessionId, user);
}

export function getRequestIdentity(c: Context<WebEnv>): RequestIdentity {
	return c.get('requestIdentity') ?? getOrCreateRequestIdentity(c);
}
