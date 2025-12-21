/**
 * Integration tests for HelpGameplaySubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HelpCommand } from './help-command.js';
import { HelpGameplaySubCommand } from './help-gameplay-subcommand.js';

import {
	createTestHarness,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';

describe('HelpGameplaySubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new HelpCommand([new HelpGameplaySubCommand()])]);
	});


	it('should respond with gameplay help', async () => {
		const result = await harness.executeCommand({
			commandName: 'help',
			subcommand: 'gameplay',
			options: {},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		expect(result.didRespond()).toBe(true);
	});
});
