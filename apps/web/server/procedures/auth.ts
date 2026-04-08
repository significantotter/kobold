import { os } from '@orpc/server';
import { z } from 'zod';
import { Config } from '@kobold/config';
import { setCookie } from 'hono/cookie';
import type { AppContext } from '../context';

const orpc = os.$context<AppContext>();

const FRONTEND_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';

// Discord OAuth2 configuration
const DISCORD_OAUTH_SCOPES = ['identify'].join(' ');

/**
 * Builds the Discord OAuth2 authorization URL
 */
function buildDiscordAuthUrl(state: string): string {
	const params = new URLSearchParams({
		client_id: Config.discordOAuth.clientId,
		redirect_uri: `${FRONTEND_URL}/oauth/callback`,
		response_type: 'code',
		scope: DISCORD_OAUTH_SCOPES,
		state,
	});

	return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

/**
 * Auth router with Discord OAuth procedures
 */
export const authRouter = orpc.router({
	/**
	 * Get the Discord OAuth authorization URL
	 * Client should redirect to this URL to start the OAuth flow
	 */
	getAuthUrl: orpc
		.input(z.object({ returnTo: z.string().optional() }).optional())
		.output(z.object({ url: z.string(), state: z.string() }))
		.handler(async ({ input }) => {
			// Generate a random state for CSRF protection, embed returnTo for post-login redirect
			const statePayload = {
				csrf: crypto.randomUUID(),
				returnTo: input?.returnTo || '/',
			};
			const state = Buffer.from(JSON.stringify(statePayload)).toString('base64');

			const url = buildDiscordAuthUrl(state);

			return { url, state };
		}),

	/**
	 * Get the current authenticated user
	 * Returns null if not authenticated
	 */
	getUser: orpc
		.input(z.object({}).optional())
		.output(
			z
				.object({
					id: z.string(),
					username: z.string(),
					discriminator: z.string(),
					avatar: z.string().nullable(),
				})
				.nullable()
		)
		.handler(async ({ context }) => {
			if (!context.user) {
				return null;
			}

			return {
				id: context.user.userId,
				username: context.user.username,
				discriminator: context.user.discriminator,
				avatar: context.user.avatar,
			};
		}),

	/**
	 * Log out the current user
	 * Clears the session cookie
	 */
	logout: orpc
		.input(z.object({}).optional())
		.output(z.object({ success: z.boolean() }))
		.handler(async ({ context }) => {
			setCookie(context.honoContext, 'session', '', {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'Lax',
				maxAge: 0,
				path: '/',
			});

			return { success: true };
		}),
});

export type AuthRouter = typeof authRouter;
