import { test as setup, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const authDir = path.resolve(import.meta.dirname, '..', 'auth');
const authFile = path.resolve(authDir, 'discord-auth.json');

setup('authenticate with Discord', async ({ page }) => {
	// Skip login if we already have a valid auth state
	if (fs.existsSync(authFile)) {
		// Verify the saved auth state still works
		await page
			.context()
			.addCookies(JSON.parse(fs.readFileSync(authFile, 'utf-8')).cookies ?? []);
		await page.goto('/channels/@me');

		// If we land on the app (not login), the auth state is still valid
		const isLoggedIn = await page
			.locator('[class*="guilds"], [aria-label="Servers sidebar"]')
			.first()
			.waitFor({ timeout: 10_000 })
			.then(() => true)
			.catch(() => false);

		if (isLoggedIn) {
			return;
		}
	}

	const email = process.env.DISCORD_EMAIL;
	const password = process.env.DISCORD_PASSWORD;

	if (!email || !password) {
		throw new Error(
			'DISCORD_EMAIL and DISCORD_PASSWORD must be set in .env. ' +
				'See .env.example for details.'
		);
	}

	await page.goto('/login');

	// Wait for the login form to be ready (don't use networkidle — Discord
	// keeps background connections open which stalls it indefinitely)
	await page.locator('input[name="email"]').waitFor({ state: 'visible', timeout: 10_000 });
	await page.locator('input[name="email"]').fill(email);
	await page.locator('input[name="password"]').fill(password);
	await page.locator('button[type="submit"]').click();

	// Wait for the app to fully load after login (guild sidebar appears)
	await expect(
		page.locator('[class*="guilds"], [aria-label="Servers sidebar"]').first()
	).toBeVisible({ timeout: 30_000 });

	// Ensure the auth directory exists
	fs.mkdirSync(authDir, { recursive: true });

	// Save auth state for reuse across test runs
	await page.context().storageState({ path: authFile });
});
