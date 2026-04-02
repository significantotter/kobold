import { Hono } from 'hono';
import { Config } from '@kobold/config';
import { Kobold, getDialect } from '@kobold/db';

const FRONTEND_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
const WG_BASE = 'https://legacy.wanderersguide.app/api';

export const wgOauthRoute = new Hono();

/**
 * Initiates the Wanderer's Guide OAuth flow.
 * Expects ?characterId=<id> as a query parameter.
 * Redirects the user to WG's authorization page.
 */
wgOauthRoute.get('/authorize', c => {
	const characterId = c.req.query('characterId');
	if (!characterId) {
		return c.redirect(`${FRONTEND_URL}/wg/oauth-error?error=missing_character_id`);
	}

	const characterPath = characterId ? `/${characterId}` : '';
	const params = new URLSearchParams({
		response_type: 'code',
		client_id: Config.wanderersGuide.apiKey,
		redirect_uri: `${Config.api.baseUrl}/wg-oauth/callback`,
	});

	const authorizeUrl = `${WG_BASE}/oauth2/authorize${characterPath}?${params.toString()}`;
	return c.redirect(authorizeUrl);
});

/**
 * Handles the Wanderer's Guide OAuth callback.
 * Exchanges the authorization code for an access token and stores it in the DB.
 */
wgOauthRoute.get('/callback', async c => {
	const code = c.req.query('code');
	const error = c.req.query('error');

	if (error) {
		console.error('WG OAuth error:', error);
		return c.redirect(`${FRONTEND_URL}/wg/oauth-error?error=${encodeURIComponent(error)}`);
	}

	if (!code) {
		return c.redirect(`${FRONTEND_URL}/wg/oauth-error?error=missing_code`);
	}

	try {
		// Exchange code for token using WG's non-standard API
		const tokenResponse = await fetch(
			`${WG_BASE}/oauth2/token?code=${encodeURIComponent(code)}&client_id=${encodeURIComponent(Config.wanderersGuide.apiKey)}`,
			{
				method: 'POST',
				headers: {
					Authorization: `Apikey ${Config.wanderersGuide.apiKey}`,
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			}
		);

		if (!tokenResponse.ok) {
			const errorText = await tokenResponse.text();
			console.error('WG token exchange failed:', errorText);
			return c.redirect(`${FRONTEND_URL}/wg/oauth-error?error=token_exchange_failed`);
		}

		const tokenData = (await tokenResponse.json()) as {
			char_id: number;
			access_token: string;
			access_rights: string;
			token_type: string;
			expires_in?: number;
			expires_at?: string;
		};

		let expiresAt = new Date();
		if (tokenData.expires_in) {
			expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);
		} else if (tokenData.expires_at) {
			expiresAt = new Date(tokenData.expires_at);
		}

		// Store the token in the database
		const dialect = getDialect(Config.database.url);
		const kobold = new Kobold(dialect);
		await kobold.wgAuthToken.create({
			charId: tokenData.char_id,
			accessToken: tokenData.access_token,
			accessRights: tokenData.access_rights,
			expiresAt,
			tokenType: tokenData.token_type,
		});

		console.log(`WG OAuth: stored token for character ${tokenData.char_id}`);
		return c.redirect(`${FRONTEND_URL}/wg/oauth-authorized`);
	} catch (err) {
		console.error('WG OAuth callback error:', err);
		return c.redirect(`${FRONTEND_URL}/wg/oauth-error?error=callback_failed`);
	}
});
