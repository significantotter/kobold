import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const wsEndpointPath = path.resolve(import.meta.dirname, '.browser-ws-endpoint');

const authFile = path.resolve(import.meta.dirname, 'auth', 'discord-auth.json');

export default defineConfig({
	globalSetup: './global-setup.ts',
	globalTeardown: './global-teardown.ts',
	testDir: './tests',
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	workers: 1,
	reporter: [['html', { open: 'never' }], ['list']],
	timeout: 60_000,

	use: {
		baseURL: 'https://discord.com',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		video: 'on-first-retry',
		connectOptions: fs.existsSync(wsEndpointPath)
			? { wsEndpoint: fs.readFileSync(wsEndpointPath, 'utf-8') }
			: undefined,
	},

	projects: [
		{
			name: 'db-setup',
			testMatch: /db\.setup\.ts/,
		},
		{
			name: 'setup',
			testMatch: /auth\.setup\.ts/,
		},
		{
			name: 'character-setup',
			testMatch: /character\.setup\.ts/,
			use: {
				...devices['Desktop Chrome'],
				storageState: authFile,
			},
			dependencies: ['db-setup', 'setup'],
		},
		{
			name: 'discord',
			use: {
				...devices['Desktop Chrome'],
			},
			dependencies: ['setup', 'character-setup'],
		},
	],
});
