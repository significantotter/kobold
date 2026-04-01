import { call } from '@orpc/server';
import type { Context as HonoContext } from 'hono';
import type { AppRouter } from './router.js';
import type { AppContext } from './context.js';

interface ORPCHandlerOptions {
	router: AppRouter;
	createContext: () => AppContext;
}

/**
 * Creates an oRPC handler for Hono.
 * Handles POST requests to /api/* endpoints.
 */
export function createORPCHandler(options: ORPCHandlerOptions) {
	const { router, createContext } = options;

	return async (c: HonoContext) => {
		const path = c.req.path.replace(/^\/api\/?/, '');
		const pathParts = path.split('/').filter(Boolean);

		if (c.req.method === 'GET') {
			// Handle GET requests (for queries without input)
			return handleProcedure(c, router, pathParts, createContext, undefined);
		}

		if (c.req.method === 'POST') {
			const body = await c.req.json().catch(() => ({}));
			return handleProcedure(c, router, pathParts, createContext, body);
		}

		return c.json({ error: 'Method not allowed' }, 405);
	};
}

async function handleProcedure(
	c: HonoContext,
	router: AppRouter,
	pathParts: string[],
	createContext: () => AppContext,
	input: unknown
) {
	try {
		// Navigate to the procedure
		let current: any = router;
		for (const part of pathParts) {
			if (current[part]) {
				current = current[part];
			} else {
				return c.json({ error: `Procedure not found: ${pathParts.join('/')}` }, 404);
			}
		}

		// Check if we found a procedure
		if (typeof current !== 'function' && !current['~orpc']) {
			return c.json({ error: `Invalid procedure: ${pathParts.join('/')}` }, 404);
		}

		// Create context and execute procedure
		const ctx = createContext();
		const result = await call(current, input, { context: ctx });
		return c.json({ result });
	} catch (error) {
		console.error('oRPC error:', error);
		const message = error instanceof Error ? error.message : 'Internal server error';
		return c.json({ error: message }, 500);
	}
}
