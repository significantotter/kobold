import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		setupFiles: 'vitest.setup.ts',
		restoreMocks: true,
		include: ['./src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		// We need this because we're using a global database connection
		// and we're truncating the db after each test
		// so when we truncate, other active workers request the resource being truncated
		// deadlocking other workers
		singleThread: true,
	},
});
