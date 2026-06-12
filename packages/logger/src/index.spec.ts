import { PassThrough } from 'node:stream';
import { describe, expect, it } from 'vitest';
import { createLogger } from './index.js';

describe('production logger defaults', () => {
	it('writes one parseable JSON object per log entry', async () => {
		const output = new PassThrough();
		const chunks: string[] = [];
		output.on('data', chunk => chunks.push(chunk.toString()));

		const logger = createLogger({
			service: 'test',
			environment: 'production',
			pretty: false,
			destination: output,
		});

		logger.info(
			{
				status: 200,
				durationMs: 4,
				headers: { authorization: 'Bearer secret-token' },
			},
			'request completed'
		);
		await new Promise(resolve => output.end(resolve));

		const lines = chunks.join('').trim().split('\n');
		expect(lines).toHaveLength(1);
		expect(JSON.parse(lines[0])).toMatchObject({
			level: 'info',
			service: 'test',
			environment: 'production',
			status: 200,
			durationMs: 4,
			headers: { authorization: '[Redacted]' },
			msg: 'request completed',
		});
		expect(JSON.parse(lines[0]).time).toMatch(
			/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
		);
	});
});
