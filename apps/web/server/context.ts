import type { Context as HonoContext } from 'hono';
import { getCookie } from 'hono/cookie';
import type { Kobold } from '@kobold/db';
import { kobold } from './services.js';
import { verifySessionToken } from './session.js';
import { getRequestIdentity, type WebEnv } from './request-identity.js';

export interface SessionUser {
	userId: string;
	username: string;
	discriminator: string;
	avatar: string | null;
	displayName: string;
}

export interface AppContext {
	/** The current user's Discord ID, if authenticated */
	userId: string | null;
	/** Decoded session user data, if authenticated */
	user: SessionUser | null;
	/** Stable anonymous session ID used to correlate logs. */
	sessionId: string;
	/** The raw Hono context for accessing cookies, headers, etc. */
	honoContext: HonoContext;
	/** Shared Kobold database service */
	kobold: Kobold;
}

/**
 * Creates the request context for oRPC procedures.
 * Extracts user session from cookies/headers.
 */
export function createContext(c: HonoContext<WebEnv>): AppContext {
	// Get session token from cookie
	const sessionToken = getCookie(c, 'session');

	let userId: string | null = null;
	let user: SessionUser | null = null;

	if (sessionToken) {
		const payload = verifySessionToken(sessionToken);
		if (payload) {
			userId = payload.userId;
			user = {
				userId: payload.userId,
				username: payload.username ?? 'Unknown',
				discriminator: payload.discriminator ?? '0',
				avatar: payload.avatar ?? null,
				displayName: payload.displayName ?? payload.username ?? 'Unknown',
			};
		}
	}

	return {
		userId,
		user,
		sessionId: getRequestIdentity(c).sessionId,
		honoContext: c,
		kobold,
	};
}

export type Context = AppContext;
