import fs from 'node:fs';
import path from 'node:path';

const WS_ENDPOINT_PATH = path.resolve(import.meta.dirname, '.browser-ws-endpoint');

async function globalTeardown() {
	const browserServer = (globalThis as any).__BROWSER_SERVER__;
	if (browserServer) {
		await browserServer.close();
	}
	// Clean up the temp file
	if (fs.existsSync(WS_ENDPOINT_PATH)) {
		fs.unlinkSync(WS_ENDPOINT_PATH);
	}
}

export default globalTeardown;
