import { defineConfig } from 'vitest/config';

/**
 * Vitest configuration using projects to run both unit and integration tests
 * with combined reporting.
 *
 * - Unit tests run in parallel (default behavior)
 * - Integration tests run sequentially (singleThread: true)
 */
export default defineConfig({
	test: {
		projects: [
			{
				extends: true,
				test: {
					name: 'unit',
					globals: true,
					setupFiles: 'vitest.setup.ts',
					restoreMocks: true,
					include: ['./src/**/*.spec.ts'],
					exclude: ['**/node_modules/**', '**/*.integration.spec.ts'],
				},
			},
			{
				extends: true,
				test: {
					name: 'integration',
					globals: true,
					setupFiles: 'vitest.setup.ts',
					restoreMocks: true,
					include: ['./src/**/*.integration.spec.ts'],
					// Sequential execution for DB tests
					maxWorkers: 1,
				},
			},
		],
	},
});
