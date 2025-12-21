/**
 * Integration tests for HelpInitSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HelpCommand } from './help-command.js';
import { HelpInitSubCommand } from './help-init-subcommand.js';

import {
	createTestHarness,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';

describe('HelpInitSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new HelpCommand([new HelpInitSubCommand()])]);
	});


	it('should respond with initiative help', async () => {
		const result = await harness.executeCommand({
			commandName: 'help',
			subcommand: 'init',
			options: {},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		expect(result.didRespond()).toBe(true);
	});
});
