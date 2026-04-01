import type { Context as HonoContext } from 'hono';
import { getCookie } from 'hono/cookie';

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
		try {
			const payload = JSON.parse(Buffer.from(sessionToken, 'base64').toString('utf-8'));
			if (payload.exp && payload.exp > Date.now() && payload.userId) {
				userId = payload.userId;
				user = {
					userId: payload.userId,
					username: payload.username ?? 'Unknown',
					discriminator: payload.discriminator ?? '0',
					avatar: payload.avatar ?? null,
				};
			}
		} catch {
			// Invalid session token — treat as unauthenticated
		}
	}

	return {
		userId,
		user,
		honoContext: c,
	};
}

export type Context = AppContext;
