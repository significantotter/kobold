import type { Context as HonoContext } from 'hono';
import { getCookie } from 'hono/cookie';
import type { Kobold } from '@kobold/db';
import { kobold } from './services.js';
import { verifySessionToken } from './session.js';

export interface SessionUser {
	userId: string;
	username: string;
	discriminator: string;
	avatar: string | null;
}

export interface AppContext {
	/** The current user's Discord ID, if authenticated */
	userId: string | null;
	/** Decoded session user data, if authenticated */
	user: SessionUser | null;
	/** The raw Hono context for accessing cookies, headers, etc. */
	honoContext: HonoContext;
	/** Shared Kobold database service */
	kobold: Kobold;
}

/**
 * Creates the request context for oRPC procedures.
 * Extracts user session from cookies/headers.
 */
export function createContext(c: HonoContext): AppContext {
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
			};
		}
	}

	return {
		userId,
		user,
		honoContext: c,
		kobold,
	};
}

export type Context = AppContext;
