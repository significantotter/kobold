import { Hono } from 'hono';
import { z } from 'zod';
import {
	createRequestLogMetadata,
	formatPageViewLogMessage,
	logger,
} from '../logging.js';
import { getRequestIdentity, type WebEnv } from '../request-identity.js';

const zPageViewRouteData = {
	path: z.string().startsWith('/').max(2_048),
	routeName: z.string().max(100).nullable(),
	routePattern: z.string().startsWith('/').max(2_048).nullable(),
};

export const zPageView = z.discriminatedUnion('navigationType', [
	z.object({
		navigationType: z.literal('landing'),
		...zPageViewRouteData,
		fromPath: z.null(),
		documentNavigationType: z
			.enum(['navigate', 'reload', 'back_forward', 'prerender'])
			.nullable(),
	}),
	z.object({
		navigationType: z.literal('navigation'),
		...zPageViewRouteData,
		fromPath: z.string().startsWith('/').max(2_048),
		documentNavigationType: z.null(),
	}),
]);

export const pageViewRoute = new Hono<WebEnv>();

pageViewRoute.post('/page-view', async c => {
	const result = zPageView.safeParse(await c.req.json().catch(() => null));
	if (!result.success) {
		logger.warn('invalid page view telemetry', {
			validationIssues: result.error.issues,
		});
		return c.body(null, 400);
	}

	const requestMetadata = createRequestLogMetadata({
		request: c.req.raw,
		status: 204,
		durationMs: 0,
	});
	const metadata = {
		event: 'page_view',
		...result.data,
		requestId: requestMetadata.requestId,
		userAgent: requestMetadata.userAgent,
		...getRequestIdentity(c),
	};

	logger.info(formatPageViewLogMessage(metadata), metadata);
	return c.body(null, 204);
});
