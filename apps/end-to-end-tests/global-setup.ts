import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const WS_ENDPOINT_PATH = path.resolve(import.meta.dirname, '.browser-ws-endpoint');

async function globalSetup() {
	const browserServer = await chromium.launchServer({
		// Respect --headed via the PWTEST_HEADED env that Playwright sets,
		// or an explicit HEADED env variable.
		headless: !process.env.HEADED && !process.env.PWTEST_HEADED,
	});
	const wsEndpoint = browserServer.wsEndpoint();
	fs.writeFileSync(WS_ENDPOINT_PATH, wsEndpoint, 'utf-8');
	// Store the server on the global so teardown can close it
	(globalThis as any).__BROWSER_SERVER__ = browserServer;
}

export default globalSetup;
