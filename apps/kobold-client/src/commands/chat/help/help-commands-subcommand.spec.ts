/**
 * Integration tests for HelpCommandsSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HelpCommand } from './help-command.js';
import { HelpCommandsSubCommand } from './help-commands-subcommand.js';

import {
	createTestHarness,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';

describe('HelpCommandsSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new HelpCommand([new HelpCommandsSubCommand()])]);
	});


	it('should respond with commands list', async () => {
		const result = await harness.executeCommand({
			commandName: 'help',
			subcommand: 'commands',
			options: {},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		expect(result.didRespond()).toBe(true);
	});
});
