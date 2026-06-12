import { describe, expect, it } from 'vitest';
import {
	createRequestLogMetadata,
	formatPageViewLogMessage,
	formatRequestLogMessage,
	shouldSkipRequestIdentity,
	shouldSkipRequestLog,
} from './logging.js';

describe('web server logging', () => {
	it.each([
		'/health',
		'/telemetry/page-view',
		'/assets',
		'/assets/index-abc123.js',
		'/favicon.ico',
		'/images/peridot.png',
		'/fonts/inter.woff2',
		'/app.webmanifest',
	])('skips health checks and static asset requests for %s', pathname => {
		expect(shouldSkipRequestLog(pathname)).toBe(true);
	});

	it.each(['/api/character/import', '/', '/oauth/callback', '/characters/12'])(
		'retains application request logging for %s',
		pathname => {
			expect(shouldSkipRequestLog(pathname)).toBe(false);
		}
	);

	it('creates request identity for telemetry but not health or assets', () => {
		expect(shouldSkipRequestIdentity('/telemetry/page-view')).toBe(false);
		expect(shouldSkipRequestIdentity('/health')).toBe(true);
		expect(shouldSkipRequestIdentity('/assets/index.js')).toBe(true);
	});

	it('adds diagnostic metadata without logging sensitive query parameters', () => {
		const request = new Request(
			'https://kobold.example/oauth/callback?code=secret&state=also-secret',
			{
				method: 'POST',
				headers: {
					'content-length': '321',
					'content-type': 'application/json',
					'user-agent': 'test-agent',
					'x-request-id': 'request-123',
				},
			}
		);

		expect(
			createRequestLogMetadata({
				request,
				status: 302,
				durationMs: 14,
			})
		).toEqual({
			requestId: 'request-123',
			method: 'POST',
			path: '/oauth/callback',
			status: 302,
			durationMs: 14,
			contentType: 'application/json',
			contentLength: 321,
			userAgent: 'test-agent',
		});
	});

	it('formats concise development request messages', () => {
		expect(
			formatRequestLogMessage({
				method: 'POST',
				path: '/api/auth/getUser',
				status: 200,
				durationMs: 3,
			})
		).toBe('POST /api/auth/getUser 200 3ms');
	});

	it('distinguishes page landings from SPA navigations', () => {
		expect(
			formatPageViewLogMessage({
				navigationType: 'landing',
				path: '/characters',
			})
		).toBe('page landing /characters');

		expect(
			formatPageViewLogMessage({
				navigationType: 'navigation',
				fromPath: '/characters',
				path: '/characters/42',
			})
		).toBe('SPA navigation /characters -> /characters/42');
	});

	it('normalizes malformed content length metadata to null', () => {
		const request = new Request('https://kobold.example/api/character/import', {
			headers: { 'content-length': 'unknown' },
		});

		expect(
			createRequestLogMetadata({
				request,
				status: 200,
				durationMs: 1,
			}).contentLength
		).toBeNull();
	});
});
