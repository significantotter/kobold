import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { Config } from '@kobold/config';
import { RPCHandler } from '@orpc/server/fetch';
import { onError } from '@orpc/server';
import { router } from './router.js';
import { createContext } from './context.js';
import { oauthCallbackRoute } from './routes/oauth-callback.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { inspect } from 'util';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = new Hono();

function getErrorProperty(error: unknown, property: string): unknown {
	if (error && typeof error === 'object' && property in error) {
		return (error as Record<string, unknown>)[property];
	}
	return undefined;
}

function formatOrpcError(error: unknown): string {
	const cause = getErrorProperty(error, 'cause');
	const validationIssues =
		getErrorProperty(cause, 'issues') ?? getErrorProperty(error, 'issues');
	const validationData = getErrorProperty(cause, 'data') ?? getErrorProperty(error, 'data');

	return inspect(
		{
			error,
			validationIssues,
			validationData,
		},
		{
			depth: null,
			colors: process.stderr.isTTY,
			maxArrayLength: null,
			maxStringLength: null,
		}
	);
}

// Middleware
app.use('*', logger());
if (process.env.NODE_ENV !== 'production') {
	app.use(
		'*',
		cors({
			origin: 'http://localhost:5173',
			credentials: true,
		})
	);
}

// Health check
app.get('/health', c => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// OAuth callback route (needs HTTP redirect, not RPC)
app.route('/oauth', oauthCallbackRoute);

// oRPC API handler (official Hono adapter pattern)
const handler = new RPCHandler(router, {
	interceptors: [
		onError(error => {
			console.error('oRPC error:', formatOrpcError(error));
		}),
	],
});

app.use('/api/*', async (c, next) => {
	const start = Date.now();
	const { matched, response } = await handler.handle(c.req.raw, {
		prefix: '/api',
		context: createContext(c),
	});
	const durationMs = Date.now() - start;

	console.info('[web-api timing]', {
		method: c.req.method,
		path: new URL(c.req.url).pathname,
		matched,
		status: response?.status ?? null,
		durationMs,
	});

	if (matched) {
		return c.newResponse(response.body, response);
	}

	await next();
});

// Static file serving (production)
if (process.env.NODE_ENV === 'production') {
	const staticPath = path.resolve(__dirname, '../client');

	// Serve static files
	app.use('/*', serveStatic({ root: staticPath }));

	// SPA fallback - serve index.html for non-API routes
	app.get('*', async c => {
		const fs = await import('fs/promises');
		const indexPath = path.join(staticPath, 'index.html');
		try {
			const html = await fs.readFile(indexPath, 'utf-8');
			return c.html(html);
		} catch {
			return c.text('Not found', 404);
		}
	});
}

// Start server
const port = Config.api.port || 3000;

console.log(`Starting server on port ${port}...`);

serve(
	{
		fetch: app.fetch,
		port,
	},
	(info: { port: number }) => {
		console.log(`Server is running on http://localhost:${info.port}`);
	}
);

export default app;
