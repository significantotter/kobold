import { Hono } from 'hono';
import { setCookie, getCookie } from 'hono/cookie';
import { Config } from '@kobold/config';
import { createSessionToken } from '../session.js';

const FRONTEND_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';

export const oauthCallbackRoute = new Hono();

const DISCORD_API_BASE = 'https://discord.com/api/v10';

interface DiscordTokenResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
}

interface DiscordUser {
	id: string;
	username: string;
	discriminator: string;
	avatar: string | null;
	global_name: string | null;
}

/**
 * Exchange authorization code for access token
 */
async function exchangeCodeForToken(code: string): Promise<DiscordTokenResponse> {
	const response = await fetch(`${DISCORD_API_BASE}/oauth2/token`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			client_id: Config.discordOAuth.clientId,
			client_secret: Config.discordOAuth.clientSecret,
			grant_type: 'authorization_code',
			code,
			redirect_uri: `${FRONTEND_URL}/oauth/callback`,
		}),
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Failed to exchange code: ${error}`);
	}

	return response.json();
}

/**
 * Fetch user info from Discord
 */
async function fetchDiscordUser(accessToken: string): Promise<DiscordUser> {
	const response = await fetch(`${DISCORD_API_BASE}/users/@me`, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Failed to fetch user: ${error}`);
	}

	return response.json();
}

/**
 * Returns true when `path` is a safe same-origin relative path.
 * Rejects protocol-relative URLs (//evil.com), absolute URLs, and other schemes.
 */
function isSafeRedirectPath(path: string): boolean {
	return path.startsWith('/') && !path.startsWith('//');
}

/**
 * OAuth callback endpoint
 * Receives the authorization code from Discord and exchanges it for an access token
 */
oauthCallbackRoute.get('/callback', async c => {
	const code = c.req.query('code');
	const error = c.req.query('error');

	// Handle OAuth errors
	if (error) {
		console.error('OAuth error:', error);
		return c.redirect('/login-error?error=' + encodeURIComponent(error));
	}

	// Validate required parameters
	if (!code) {
		return c.redirect('/login-error?error=missing_code');
	}

	// Validate CSRF state matches the cookie set during getAuthUrl
	const stateParam = c.req.query('state');
	const storedCsrf = getCookie(c, 'oauth_csrf');

	if (!stateParam || !storedCsrf) {
		return c.redirect('/login-error?error=missing_state');
	}

	let statePayload: { csrf?: string; returnTo?: string };
	try {
		statePayload = JSON.parse(Buffer.from(stateParam, 'base64').toString('utf-8'));
	} catch {
		return c.redirect('/login-error?error=invalid_state');
	}

	if (!statePayload.csrf || statePayload.csrf !== storedCsrf) {
		return c.redirect('/login-error?error=invalid_state');
	}

	// Clear the one-time CSRF cookie
	setCookie(c, 'oauth_csrf', '', { httpOnly: true, maxAge: 0, path: '/' });

	try {
		// Exchange code for access token
		const tokenResponse = await exchangeCodeForToken(code);

		// Fetch user info
		const user = await fetchDiscordUser(tokenResponse.access_token);

		console.log(`User authenticated: ${user.id}`);

		// Create HMAC-signed session token
		const sessionToken = createSessionToken(user);

		// Set session cookie
		setCookie(c, 'session', sessionToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'Lax',
			maxAge: 7 * 24 * 60 * 60, // 7 days
			path: '/',
		});

		// Redirect to returnTo path from state, or home page
		let redirectTo = '/';
		if (
			typeof statePayload.returnTo === 'string' &&
			isSafeRedirectPath(statePayload.returnTo)
		) {
			redirectTo = statePayload.returnTo;
		}
		return c.redirect(redirectTo);
	} catch (err) {
		console.error('OAuth callback error:', err);
		const errorMessage = err instanceof Error ? err.message : 'unknown_error';
		return c.redirect('/login-error?error=' + encodeURIComponent(errorMessage));
	}
});
