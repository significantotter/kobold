import { test as setup, expect } from '@playwright/test';
import { Config } from '@kobold/config';
import path from 'node:path';
import fs from 'node:fs';

const authDir = path.resolve(import.meta.dirname, '..', 'auth');
const authFile = path.resolve(authDir, 'discord-auth.json');

const DEBUG = !!process.env.DEBUG_FIXTURE;
const _t0 = Date.now();
function log(msg: string) {
	if (DEBUG) console.log(`[auth-setup] [${((Date.now() - _t0) / 1000).toFixed(1)}s] ${msg}`);
}
async function timed<T>(label: string, fn: () => Promise<T>): Promise<T> {
	log(`${label}...`);
	const start = Date.now();
	const result = await fn();
	log(`${label} done (${Date.now() - start}ms)`);
	return result;
}

setup('authenticate with Discord', async ({ page }) => {
	// Skip login if we already have a valid auth state
	if (fs.existsSync(authFile)) {
		log(`Auth file exists, verifying saved state...`);
		// Verify the saved auth state still works
		await timed('addCookies', () =>
			page.context().addCookies(JSON.parse(fs.readFileSync(authFile, 'utf-8')).cookies ?? [])
		);
		await timed('goto /channels/@me', () => page.goto('/channels/@me'));
		log(`Current URL: ${page.url()}`);

		// Check what's on screen: interstitial, guild sidebar, or something else
		const continueInBrowser = page
			.getByRole('button', { name: /continue in browser/i })
			.or(page.locator('a', { hasText: /continue in browser/i }))
			.or(page.locator('button', { hasText: /open discord in your browser/i }));

		const guildSidebar = page
			.locator('[class*="guilds"], [aria-label="Servers sidebar"]')
			.first();

		const landingResult = await timed('race interstitial vs sidebar', () =>
			Promise.race([
				continueInBrowser
					.first()
					.waitFor({ state: 'visible', timeout: 10_000 })
					.then(() => 'interstitial' as const),
				guildSidebar
					.waitFor({ state: 'visible', timeout: 10_000 })
					.then(() => 'logged-in' as const),
			]).catch(() => 'timeout' as const)
		);

		log(`Landing result: ${landingResult}`);

		if (landingResult === 'interstitial') {
			await timed('click Continue in browser', () => continueInBrowser.first().click());

			// After the interstitial, Discord either loads the app (valid cookies)
			// or redirects to /login (stale cookies). Race both so we don't waste
			// 10s waiting for a sidebar that will never appear.
			const loginForm = page.locator('input[name="email"]');
			const postInterstitial = await timed('race sidebar vs login form', () =>
				Promise.race([
					guildSidebar.waitFor({ timeout: 10_000 }).then(() => 'logged-in' as const),
					loginForm
						.waitFor({ state: 'visible', timeout: 10_000 })
						.then(() => 'login-page' as const),
				]).catch(() => 'timeout' as const)
			);

			log(`Post-interstitial result: ${postInterstitial}`);

			if (postInterstitial === 'logged-in') {
				log(`Auth state valid (via interstitial). Saving and returning.`);
				fs.mkdirSync(authDir, { recursive: true });
				await timed('save storageState', () =>
					page.context().storageState({ path: authFile })
				);
				return;
			}
			// If login-page or timeout, fall through to the login flow below
		} else if (landingResult === 'logged-in') {
			log(`Auth state valid. Returning.`);
			return;
		} else {
			log(`Timed out. Page title: ${await page.title()}`);
			log(`Page URL: ${page.url()}`);
			// Log visible text on page for debugging
			const bodyText = await page
				.locator('body')
				.innerText()
				.catch(() => '(error reading body)');
			log(`Page body (first 500 chars): ${bodyText.slice(0, 500)}`);
		}
	} else {
		log(`No auth file found, proceeding to login.`);
	}

	const email = Config.e2e?.discordEmail;
	const password = Config.e2e?.discordPassword;

	if (!email || !password) {
		throw new Error(
			'DISCORD_EMAIL and DISCORD_PASSWORD must be set in .env. ' +
				'See .env.example for details.'
		);
	}

	// Skip navigation if we're already on the login page (e.g. redirected after interstitial)
	if (!page.url().includes('/login')) {
		await timed('goto /login', () => page.goto('/login'));
	}
	log(`On login page. URL: ${page.url()}`);

	// Wait for the login form to be ready (don't use networkidle — Discord
	// keeps background connections open which stalls it indefinitely)
	await timed('waitFor email input', () =>
		page.locator('input[name="email"]').waitFor({ state: 'visible', timeout: 10_000 })
	);
	await timed('fill email', () => page.locator('input[name="email"]').fill(email));
	await timed('fill password', () => page.locator('input[name="password"]').fill(password));
	await timed('click submit', () => page.locator('button[type="submit"]').click());

	// Wait for the app to fully load after login (guild sidebar appears)
	await timed('waitFor guild sidebar', () =>
		expect(
			page.locator('[class*="guilds"], [aria-label="Servers sidebar"]').first()
		).toBeVisible({ timeout: 30_000 })
	);

	// Ensure the auth directory exists
	fs.mkdirSync(authDir, { recursive: true });

	// Save auth state for reuse across test runs
	await timed('save storageState', () => page.context().storageState({ path: authFile }));
});
