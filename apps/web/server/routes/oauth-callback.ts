import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import { Config } from '@kobold/config';

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
 * Create a session token for the user
 * TODO: Implement proper JWT or session management
 */
function createSessionToken(user: DiscordUser): string {
	// Simple base64 encoding for now - REPLACE with proper JWT in production
	const payload = {
		userId: user.id,
		username: user.username,
		discriminator: user.discriminator,
		avatar: user.avatar,
		exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
	};
	return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * OAuth callback endpoint
 * Receives the authorization code from Discord and exchanges it for an access token
 */
oauthCallbackRoute.get('/callback', async c => {
	const code = c.req.query('code');
	const state = c.req.query('state');
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

	// TODO: Validate state parameter against stored state
	// if (!validateState(state)) {
	//   return c.redirect('/login-error?error=invalid_state');
	// }

	try {
		// Exchange code for access token
		const tokenResponse = await exchangeCodeForToken(code);

		// Fetch user info
		const user = await fetchDiscordUser(tokenResponse.access_token);

		console.log(`User authenticated: ${user.username} (${user.id})`);

		// Create session token
		const sessionToken = createSessionToken(user);

		// Set session cookie
		setCookie(c, 'session', sessionToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'Lax',
			maxAge: 7 * 24 * 60 * 60, // 7 days
			path: '/',
		});

		// Redirect to home page
		return c.redirect('/');
	} catch (err) {
		console.error('OAuth callback error:', err);
		const errorMessage = err instanceof Error ? err.message : 'unknown_error';
		return c.redirect('/login-error?error=' + encodeURIComponent(errorMessage));
	}
});
