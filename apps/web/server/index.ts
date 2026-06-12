import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { cors } from 'hono/cors';
import { Config } from '@kobold/config';
import { RPCHandler } from '@orpc/server/fetch';
import { onError } from '@orpc/server';
import { router } from './router.js';
import { createContext } from './context.js';
import { oauthCallbackRoute } from './routes/oauth-callback.js';
import { pageViewRoute } from './routes/page-view.js';
import {
	getOrCreateRequestIdentity,
	type WebEnv,
} from './request-identity.js';
import {
	createRequestLogMetadata,
	formatRequestLogMessage,
	logger,
	runWithLogContext,
	shouldSkipRequestIdentity,
	shouldSkipRequestLog,
} from './logging.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = new Hono<WebEnv>();

function getErrorProperty(error: unknown, property: string): unknown {
	if (error && typeof error === 'object' && property in error) {
		return (error as Record<string, unknown>)[property];
	}
	return undefined;
}

function getOrpcErrorMetadata(error: unknown): Record<string, unknown> {
	const cause = getErrorProperty(error, 'cause');
	const validationIssues =
		getErrorProperty(cause, 'issues') ?? getErrorProperty(error, 'issues');
	const validationData = getErrorProperty(cause, 'data') ?? getErrorProperty(error, 'data');

	return {
		validationIssues,
		validationData,
	};
}

// Middleware
app.use('*', async (c, next) => {
	const pathname = new URL(c.req.url).pathname;
	if (shouldSkipRequestIdentity(pathname)) {
		await next();
		return;
	}

	const identity = getOrCreateRequestIdentity(c);
	c.set('requestIdentity', identity);
	await runWithLogContext({ ...identity }, next);
});

app.use('*', async (c, next) => {
	const pathname = new URL(c.req.url).pathname;
	if (pathname.startsWith('/api/') || shouldSkipRequestLog(pathname)) {
		await next();
		return;
	}

	const start = Date.now();
	await next();
	const metadata = createRequestLogMetadata({
		request: c.req.raw,
		status: c.res.status,
		durationMs: Date.now() - start,
	});
	logger.info(formatRequestLogMessage(metadata), metadata);
});
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

// Client-side page landings and SPA navigations
app.route('/telemetry', pageViewRoute);

// oRPC API handler (official Hono adapter pattern)
const handler = new RPCHandler(router, {
	interceptors: [
		onError(error => {
			logger.error('API request failed', error, getOrpcErrorMetadata(error));
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

	const metadata = {
		...createRequestLogMetadata({
			request: c.req.raw,
			status: response?.status ?? null,
			durationMs,
		}),
		matched,
	};
	logger.info(formatRequestLogMessage(metadata), metadata);

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

logger.info(`server starting on port ${port}`, { port });

serve(
	{
		fetch: app.fetch,
		port,
	},
	(info: { port: number }) => {
		const url = `http://localhost:${info.port}`;
		logger.info(`server ready at ${url}`, { port: info.port, url });
	}
);

export default app;
