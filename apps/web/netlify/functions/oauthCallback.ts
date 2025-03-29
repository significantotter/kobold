import axios, { type AxiosResponse } from 'axios';
import { db } from './utils/db';
import type { Handler } from '@netlify/functions';

// based on https://github.com/netlify/explorers/blob/main/functions/auth-callback.js
export const handler: Handler = async event => {
	let redirect = {
		statusCode: 302,
		headers: {
			Location: `${process.env.VITE_BASE_URL}/oauth-error`,
			'Cache-Control': 'no-cache',
		},
		body: 'redirecting to application...',
	};
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let axiosResponse: AxiosResponse<any, any> | null = null;
	try {
		if (!event.queryStringParameters) {
			return {
				statusCode: 401,
				body: JSON.stringify({ error: 'Not authorized' }),
			};
		}

		const { code } = event.queryStringParameters;

		// wanderer's guide uses a non-standard header auth method
		// so we can't continue to use the simple-oauth2 module here
		axiosResponse! = await axios({
			url: `https://legacy.wanderersguide.app/api/oauth2/token?code=${code}&client_id=${process.env.WG_CLIENT_ID}`,
			method: 'post',
			headers: {
				authorization: `Apikey ${process.env.WG_API_KEY}`,
				Accept: 'application/json',
				'content-type': 'application/json',
				'cache-control': 'no-cache',
				Connection: 'keep-alive',
			},
			responseType: 'json',
		});
		let expires_at = new Date();

		if (axiosResponse.data.expires_in) {
			expires_at.setSeconds(expires_at.getSeconds() + axiosResponse.data.expires_in);
		} else if (axiosResponse.data.expires_at) {
			expires_at = new Date(axiosResponse.data.expires_at);
		}

		await db
			.insertInto('wgAuthToken')
			.values({
				charId: axiosResponse.data.char_id,
				accessToken: axiosResponse.data.access_token,
				accessRights: axiosResponse.data.access_rights,
				expiresAt: expires_at,
				tokenType: axiosResponse.data.token_type,
			})
			.execute();
		redirect = {
			statusCode: 302,
			headers: {
				Location: `${process.env.VITE_BASE_URL}/oauth-authorized`,
				'Cache-Control': 'no-cache',
			},
			body: 'redirecting to application...',
		};
	} catch (err) {
		if (axiosResponse) console.warn(axiosResponse.data);
		if (err instanceof Error) console.error(err.message);
		console.error(err);
	}
	return redirect;
};
