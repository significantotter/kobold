import { afterEach, describe, expect, it, vi } from 'vitest';
import { logger } from '../logging.js';
import { pageViewRoute, zPageView } from './page-view.js';

afterEach(() => {
	vi.restoreAllMocks();
});

describe('page view telemetry', () => {
	it('logs a page landing with request metadata', async () => {
		const log = vi.spyOn(logger, 'info').mockImplementation(() => {});

		const response = await pageViewRoute.request('/page-view', {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				'user-agent': 'test-browser',
				'x-request-id': 'request-123',
			},
			body: JSON.stringify({
				navigationType: 'landing',
				path: '/characters/42',
				fromPath: null,
				routeName: 'character-workspace',
				routePattern: '/characters/:characterId',
				documentNavigationType: 'reload',
			}),
		});

		expect(response.status).toBe(204);
		expect(log).toHaveBeenCalledWith(
			'page landing /characters/42',
			expect.objectContaining({
				event: 'page_view',
				navigationType: 'landing',
				path: '/characters/42',
				routePattern: '/characters/:characterId',
				documentNavigationType: 'reload',
				requestId: 'request-123',
				userAgent: 'test-browser',
				userId: null,
			})
		);
	});

	it('requires a previous path for SPA navigations', () => {
		expect(
			zPageView.safeParse({
				navigationType: 'navigation',
				path: '/library',
				fromPath: null,
				routeName: 'library-workspace',
				routePattern: '/library',
				documentNavigationType: null,
			}).success
		).toBe(false);
	});
});
