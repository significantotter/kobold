import { AuthorizationCode, type ModuleOptions } from 'simple-oauth2';

// based on https://github.com/netlify/explorers/blob/main/functions/util/oauth.js
function createAuthClient(credentials: ModuleOptions) {
	if (!credentials.client.id || !credentials.client.secret) {
		throw new Error('Missing a valid Wanderers Guide OAuth client ID and secret.');
	}

	return new AuthorizationCode(credentials);
}

export const characterAuthClient = function (characterId: string) {
	let characterIdString = '';
	// format to allow a consistent url if no character id is provided
	if (characterId) characterIdString = `/${characterId}`;

	return createAuthClient({
		client: {
			id: process.env.WG_CLIENT_ID ?? '',
			secret: process.env.WG_API_KEY ?? '',
		},
		auth: {
			tokenHost: 'https://legacy.wanderersguide.app/api',
			tokenPath: 'https://legacy.wanderersguide.app/api/oauth2/token',
			authorizeHost: `https://legacy.wanderersguide.app/api`,
			authorizePath: `https://legacy.wanderersguide.app/api/oauth2/authorize${characterIdString}`,
		},
	});
};
