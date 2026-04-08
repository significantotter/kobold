import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(import.meta.dirname, '.env') });

const authFile = path.resolve(import.meta.dirname, 'auth', 'discord-auth.json');

export default defineConfig({
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
	},

	projects: [
		{
			name: 'setup',
			testMatch: /auth\.setup\.ts/,
		},
		{
			name: 'discord',
			use: {
				...devices['Desktop Chrome'],
				storageState: authFile,
			},
			dependencies: ['setup'],
		},
	],
});
