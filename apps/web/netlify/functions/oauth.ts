import type { Handler } from '@netlify/functions';
import { characterAuthClient } from './utils/auth';

// based on https://github.com/netlify/explorers/blob/main/functions/auth.js
export const handler: Handler = async event => {
	if (!event.queryStringParameters || !event.queryStringParameters.characterId) {
		return {
			statusCode: 401,
			body: JSON.stringify({
				error: 'Missing required query parameter `characterId`',
			}),
		};
	}

	const { characterId } = event.queryStringParameters;

	const oauth = characterAuthClient(characterId);

	const authorizationURI = oauth.authorizeURL({
		redirect_uri: `${process.env.VITE_BASE_URL}/.netlify/functions/oauth-callback`,
		state: process.env.WG_AUTH_STATE!,
		scope: [],
	});

	return {
		statusCode: 302,
		headers: {
			Location: `${authorizationURI}?response_type='code'`,
			'Cache-Control': 'no-cache',
		},
		body: 'redirecting to authorization...',
	};
};
