import { test as base, expect, type Page } from '@playwright/test';

const GUILD_ID = process.env.DISCORD_TEST_GUILD_ID!;
const CHANNEL_ID = process.env.DISCORD_TEST_CHANNEL_ID!;
const BOT_DISPLAY_NAME = process.env.BOT_DISPLAY_NAME ?? 'Kobold';

/** Timeout for waiting on bot responses (ms) */
const BOT_RESPONSE_TIMEOUT = 15_000;

export interface DiscordFixtures {
	discordChannel: Page;
}

/**
 * Sends a slash command by typing it into the chat input and selecting
 * the matching autocomplete option from the slash command menu.
 */
async function sendSlashCommand(page: Page, command: string): Promise<void> {
	// Click the chat input area to focus it
	const chatInput = page.locator('[role="textbox"][data-slate-editor="true"]').first();
	await chatInput.click();

	// Type the slash command — this triggers the autocomplete menu
	await chatInput.pressSequentially(command, { delay: 50 });

	// Wait for the slash command autocomplete menu to appear and select the match
	const autocompleteOption = page.locator('[class*="autocomplete"] [class*="base"]').first();
	await autocompleteOption.waitFor({ state: 'visible', timeout: 5_000 });
	await autocompleteOption.click();

	// Enter will first process the text into a slash command input
	await page.keyboard.press('Enter');
	// Wait for Discord to process the autocomplete selection, then send
	await page.waitForTimeout(500);
	await page.keyboard.press('Enter');
}

/**
 * Waits for and returns the most recent embed from the bot in the channel.
 * Uses broad, resilient selectors to handle Discord's obfuscated class names.
 */
async function waitForBotEmbed(page: Page): Promise<ReturnType<Page['locator']>> {
	// Discord embeds are rendered as <article> elements with class "embedFull__*"
	// inside message list items. Target the article itself, not its children.
	const embedLocator = page
		.locator('li[class*="messageListItem"] article[class*="embedFull"]')
		.last();

	await embedLocator.waitFor({ state: 'visible', timeout: BOT_RESPONSE_TIMEOUT });
	return embedLocator;
}

export const test = base.extend<DiscordFixtures>({
	discordChannel: async ({ page }, use) => {
		if (!GUILD_ID || !CHANNEL_ID) {
			throw new Error(
				'DISCORD_TEST_GUILD_ID and DISCORD_TEST_CHANNEL_ID must be set in .env. ' +
					'See .env.example for details.'
			);
		}

		await page.goto(`/channels/${GUILD_ID}/${CHANNEL_ID}`);

		// Handle the "Discord app detected" interstitial that sometimes appears
		// offering to open in the desktop app or continue in browser
		const continueInBrowser = page
			.getByRole('button', { name: /continue in browser/i })
			.or(page.locator('a', { hasText: /continue in browser/i }))
			.or(page.locator('button', { hasText: /open discord in your browser/i }));

		const chatInput = page.locator('[role="textbox"][data-slate-editor="true"]').first();

		// Race: either the interstitial appears or we land directly on the channel
		const landed = await Promise.race([
			continueInBrowser
				.first()
				.waitFor({ state: 'visible', timeout: 10_000 })
				.then(() => 'interstitial' as const),
			chatInput.waitFor({ state: 'visible', timeout: 10_000 }).then(() => 'channel' as const),
		]).catch(() => 'timeout' as const);

		if (landed === 'interstitial') {
			await continueInBrowser.first().click();
		}

		// Wait for the channel to be ready (chat input visible)
		await chatInput.waitFor({
			state: 'visible',
			timeout: 15_000,
		});

		await use(page);
	},
});

export { expect, sendSlashCommand, waitForBotEmbed };
