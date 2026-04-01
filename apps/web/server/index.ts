import { Hono, type Context } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { Config } from '@kobold/config';
import { createORPCHandler } from './orpc-handler.js';
import { appRouter } from './router.js';
import { createContext } from './context.js';
import { oauthCallbackRoute } from './routes/oauth-callback.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = new Hono();

// Middleware
app.use('*', logger());
app.use(
	'*',
	cors({
		origin: Config.api.baseUrl || 'http://localhost:5173',
		credentials: true,
	})
);

// Health check
app.get('/health', (c: Context) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// OAuth callback route (needs HTTP redirect, not RPC)
app.route('/oauth', oauthCallbackRoute);

// oRPC API handler
app.all('/api/*', async (c: Context) => {
	const handler = createORPCHandler({
		router: appRouter,
		createContext: () => createContext(c),
	});
	return handler(c);
});

// Static file serving (production)
if (process.env.NODE_ENV === 'production') {
	const staticPath = path.resolve(__dirname, '../client');

	// Serve static files
	app.use('/*', serveStatic({ root: staticPath }));

	// SPA fallback - serve index.html for non-API routes
	app.get('*', async (c: Context) => {
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
