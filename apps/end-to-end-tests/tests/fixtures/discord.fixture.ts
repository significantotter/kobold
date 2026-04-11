import { test as base, expect, type Locator, type Page } from '@playwright/test';
import { Config } from '@kobold/config';
import path from 'node:path';

const GUILD_ID = Config.e2e?.guildId ?? '';
const CHANNEL_ID = Config.e2e?.channelId ?? '';
const BOT_DISPLAY_NAME = Config.e2e?.botDisplayName ?? 'Kobold';

/** Timeout for waiting on bot responses (ms) */
const BOT_RESPONSE_TIMEOUT = 15_000;

const EMBED_SELECTOR = 'li[class*="messageListItem"] article[class*="embedFull"]';
const EMBED_ARTICLE = 'article[class*="embedFull"]';
const MESSAGE_LIST_ITEM = 'li[class*="messageListItem"]';

const authFile = path.resolve(import.meta.dirname, '..', '..', 'auth', 'discord-auth.json');

const DEBUG = !!process.env.DEBUG_FIXTURE;
const _ft0 = Date.now();

function log(msg: string) {
	if (DEBUG)
		console.log(`[discord-fixture] [${((Date.now() - _ft0) / 1000).toFixed(1)}s] ${msg}`);
}
async function timed<T>(label: string, fn: () => Promise<T>): Promise<T> {
	log(`${label}...`);
	const start = Date.now();
	const result = await fn();
	log(`${label} done (${Date.now() - start}ms)`);
	return result;
}

/**
 * Captures the id of the very last `<li>` in the message list.
 * Used as a baseline so wait helpers can detect genuinely new content.
 *
 * We track the last message list item (regardless of author) because:
 * - Discord groups consecutive messages from the same author into one `<li>`
 *   without repeating the username header
 * - Discord virtualizes the message list, so element counts shift unpredictably
 * - Bot deferred replies edit existing elements in place rather than adding new ones
 */
let _lastMessageItemId: string | null = null;

async function capturePreSendSnapshot(page: Page): Promise<void> {
	const msgCount = await page.locator(MESSAGE_LIST_ITEM).count();
	if (msgCount > 0) {
		_lastMessageItemId = await page
			.locator(MESSAGE_LIST_ITEM)
			.last()
			.getAttribute('id')
			.catch(() => null);
	} else {
		_lastMessageItemId = null;
	}

	log(`Pre-send snapshot: lastMessageItemId=${_lastMessageItemId}, msgCount=${msgCount}`);
}

export interface SlashCommandArg {
	/** The Discord option name (e.g. "dice", "name", "skill") */
	name: string;
	/** The value to enter for this option */
	value: string;
	/**
	 * If true, the option uses autocomplete. Retained for documentation
	 * purposes; the paste-based approach does not interact with the dropdown.
	 */
	autocomplete?: boolean;
}

export interface DiscordFixtures {
	discordChannel: Page;
}

/**
 * Pastes text into the chat input via a synthetic ClipboardEvent.
 */
async function pasteIntoChat(page: Page, text: string): Promise<void> {
	const chatInput = page.locator('[role="textbox"][data-slate-editor="true"]').first();
	await chatInput.click();

	await chatInput.evaluate((el, pasteText) => {
		const g = globalThis as any;
		const dt = new g.DataTransfer();
		dt.setData('text/plain', pasteText);
		el.dispatchEvent(
			new g.ClipboardEvent('paste', {
				clipboardData: dt,
				bubbles: true,
				cancelable: true,
			})
		);
	}, text);
}

/**
 * Waits for Discord to parse pasted text into a recognised slash command.
 * Discord may either:
 *   1. Instantly transform the text into an `applicationCommand` Slate element, or
 *   2. Show an autocomplete dropdown with the matching command that must be selected.
 * This helper handles both cases.
 */
async function waitForCommandParsed(page: Page): Promise<void> {
	const commandElement = page.locator('[data-slate-editor="true"] [class*="applicationCommand"]');
	const autocompleteOption = page.locator('[class*="autocomplete"] [role="option"]').first();

	// Race: either the command is parsed instantly or the autocomplete menu appears
	const result = await Promise.race([
		commandElement.waitFor({ state: 'visible', timeout: 5_000 }).then(() => 'parsed' as const),
		autocompleteOption
			.waitFor({ state: 'visible', timeout: 5_000 })
			.then(() => 'autocomplete' as const),
	]);

	log(`Command parsed via: ${result}`);

	if (result === 'autocomplete') {
		// Click the first matching command in the autocomplete dropdown
		await autocompleteOption.click();
		// Wait for Discord to transform the selection into the command UI
		await commandElement.waitFor({ state: 'visible', timeout: 5_000 });
	}
}

/**
 * Presses Enter and waits for the command element to disappear.
 * If the command is still in the textbox (e.g. Discord moved focus to
 * the next option field instead of sending), presses Enter again.
 * Retries up to 3 times.
 */
async function pressEnterUntilSent(page: Page): Promise<void> {
	const commandElement = page.locator('[data-slate-editor="true"] [class*="applicationCommand"]');
	for (let attempt = 1; attempt <= 3; attempt++) {
		await page.keyboard.press('Enter');
		const gone = await commandElement
			.waitFor({ state: 'hidden', timeout: 2_000 })
			.then(() => true)
			.catch(() => false);
		if (gone) {
			log(`Command dispatched after Enter attempt ${attempt}`);
			return;
		}
		log(`Command still visible after Enter attempt ${attempt}, retrying...`);
	}
	log('Warning: command element still visible after 3 Enter attempts');
}

/**
 * Sends a slash command with no arguments by pasting the full command
 * text and waiting for Discord to recognise it.
 */
async function sendSlashCommand(page: Page, command: string): Promise<void> {
	log(`Sending: ${command}`);
	await capturePreSendSnapshot(page);
	await pasteIntoChat(page, command);
	await waitForCommandParsed(page);
	await pressEnterUntilSent(page);
	log(`Sent: ${command}`);
}

/**
 * Sends a slash command that has one or more option fields.
 * Pastes the full command text with Discord's option formatting
 * (e.g. `/roll dice dice: d20+5`) so Discord parses it as a complete
 * slash command, then presses Enter to send.
 */
async function sendSlashCommandWithArgs(
	page: Page,
	command: string,
	args: SlashCommandArg[]
): Promise<void> {
	// Build the full command string with option formatting
	// Format: /command subcommand option1: value1 option2: value2
	const argString = args.map(a => `${a.name}: ${a.value}`).join(' ');
	const fullCommand = `${command} ${argString}`;

	log(`Sending: ${fullCommand}`);
	await capturePreSendSnapshot(page);
	await pasteIntoChat(page, fullCommand);
	await waitForCommandParsed(page);
	await pressEnterUntilSent(page);
	log(`Sent: ${fullCommand}`);
}

/**
 * Waits for a new embed that appeared AFTER the pre-send snapshot.
 * Runs a function inside the page context to scan message list items
 * for an embed article that appears after the snapshot marker.
 * This is immune to Discord's message list virtualization.
 */
async function waitForBotEmbed(page: Page): Promise<Locator> {
	const snapshotId = _lastMessageItemId;
	log(`Waiting for new embed (snapshot: ${snapshotId})`);

	// Run inside the page context to find an embed in a <li> after the snapshot
	await page.waitForFunction(
		({ embedArticle, itemSel, sid }) => {
			const items = document.querySelectorAll(itemSel);
			let pastSnapshot = sid === null;
			for (const item of items) {
				if (!pastSnapshot) {
					if (item.id === sid) pastSnapshot = true;
					continue;
				}
				if (item.querySelector(embedArticle)) return true;
			}
			return false;
		},
		{ embedArticle: EMBED_ARTICLE, itemSel: MESSAGE_LIST_ITEM, sid: snapshotId },
		{ timeout: BOT_RESPONSE_TIMEOUT }
	);

	const lastEmbed = page.locator(EMBED_SELECTOR).last();
	const parentLi = lastEmbed.locator('xpath=ancestor::li[contains(@class,"messageListItem")]');
	_lastMessageItemId = await parentLi.getAttribute('id').catch(() => null);
	log(`New embed found (parentId: ${_lastMessageItemId})`);

	return lastEmbed;
}

/**
 * Waits for a new embed whose content contains the given text.
 */
async function waitForBotEmbedContaining(page: Page, text: string): Promise<Locator> {
	const embed = await waitForBotEmbed(page);
	await expect(embed).toContainText(text, { timeout: BOT_RESPONSE_TIMEOUT });
	return embed;
}

/**
 * Waits for a new bot response that appeared AFTER the pre-send snapshot.
 * Runs inside the page context to find a message list item after the
 * snapshot marker that contains actual bot response content (not the
 * "sending command..." interaction loading state).
 *
 * This handles:
 * - Grouped messages (no username header on consecutive bot messages)
 * - Deferred replies (bot edits the message in place after "thinking")
 * - Discord's message list virtualization
 */
async function waitForBotMessage(page: Page): Promise<Locator> {
	const snapshotId = _lastMessageItemId;
	log(`Waiting for bot response (snapshot: ${snapshotId})`);

	// Run inside the page to watch for real bot response content
	await page.waitForFunction(
		({ itemSel, sid }) => {
			const items = document.querySelectorAll(itemSel);
			let pastSnapshot = sid === null;
			for (const item of items) {
				if (!pastSnapshot) {
					if (item.id === sid) pastSnapshot = true;
					continue;
				}
				const text = (item.textContent ?? '').toLowerCase();
				// Skip loading/interaction states that aren't real bot responses
				if (text.includes('sending command')) continue;
				if (text.includes('is thinking')) continue;
				// Any non-empty content after the snapshot is a real response
				if (text.trim().length > 0) return true;
			}
			return false;
		},
		{ itemSel: MESSAGE_LIST_ITEM, sid: snapshotId },
		{ timeout: BOT_RESPONSE_TIMEOUT }
	);

	const allItems = page.locator(MESSAGE_LIST_ITEM);
	const lastItem = allItems.last();
	_lastMessageItemId = await lastItem.getAttribute('id').catch(() => null);
	log(`New bot response found (id: ${_lastMessageItemId})`);

	return lastItem;
}

/**
 * Clicks a button on the most recent bot message. Used for confirmation prompts
 * (e.g. "Are you sure you want to remove…?" -> click "Confirm").
 */
async function clickBotButton(page: Page, buttonText: string | RegExp): Promise<void> {
	const message = await waitForBotMessage(page);
	const button = message.getByRole('button', { name: buttonText });
	await button.waitFor({ state: 'visible', timeout: BOT_RESPONSE_TIMEOUT });
	await button.click();
}

export const test = base.extend<{}, DiscordFixtures>({
	discordChannel: [
		async ({ browser }, use, workerInfo) => {
			log(`===== FIXTURE SETUP (worker ${workerInfo.workerIndex}) =====`);

			if (!GUILD_ID || !CHANNEL_ID) {
				throw new Error(
					'DISCORD_TEST_GUILD_ID and DISCORD_TEST_CHANNEL_ID must be set in .env. ' +
						'See .env.example for details.'
				);
			}

			log(`Creating browser context with storageState: ${authFile}`);
			const context = await timed('newContext', () =>
				browser.newContext({ storageState: authFile })
			);
			const page = await timed('newPage', () => context.newPage());

			await timed(`goto channel ${GUILD_ID}/${CHANNEL_ID}`, () =>
				page.goto(`https://discord.com/channels/${GUILD_ID}/${CHANNEL_ID}`)
			);

			// Handle the "Discord app detected" interstitial that sometimes appears
			// offering to open in the desktop app or continue in browser
			const continueInBrowser = page
				.getByRole('button', { name: /continue in browser/i })
				.or(page.locator('a', { hasText: /continue in browser/i }))
				.or(page.locator('button', { hasText: /open discord in your browser/i }));

			const chatInput = page.locator('[role="textbox"][data-slate-editor="true"]').first();

			// Race: either the interstitial appears or we land directly on the channel
			const landed = await timed('race interstitial vs channel', () =>
				Promise.race([
					continueInBrowser
						.first()
						.waitFor({ state: 'visible', timeout: 10_000 })
						.then(() => 'interstitial' as const),
					chatInput
						.waitFor({ state: 'visible', timeout: 10_000 })
						.then(() => 'channel' as const),
				]).catch(() => 'timeout' as const)
			);

			log(`Landing result: ${landed}`);

			if (landed === 'interstitial') {
				await timed('click Continue in browser', () => continueInBrowser.first().click());
			}

			// Wait for the channel to be ready (chat input visible)
			await timed('waitFor chatInput', () =>
				chatInput.waitFor({ state: 'visible', timeout: 15_000 })
			);

			// Wait for Discord to load message history (not just the input)
			// This prevents the initial snapshot from being empty/null
			await timed('waitFor message history', () =>
				page.locator(MESSAGE_LIST_ITEM).first().waitFor({
					state: 'visible',
					timeout: 15_000,
				})
			);

			// Take initial snapshot of existing messages so the first test
			// doesn't accidentally match stale content from previous runs
			await capturePreSendSnapshot(page);
			log(`Channel ready -- initial snapshot taken. Handing page to tests`);
			await use(page);

			log(`===== FIXTURE TEARDOWN (worker ${workerInfo.workerIndex}) =====`);
			await context.close();
		},
		{ scope: 'worker' },
	],
});

export {
	expect,
	sendSlashCommand,
	sendSlashCommandWithArgs,
	waitForBotEmbed,
	waitForBotEmbedContaining,
	waitForBotMessage,
	clickBotButton,
	BOT_DISPLAY_NAME,
};
