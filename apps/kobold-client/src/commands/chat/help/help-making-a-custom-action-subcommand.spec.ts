/**
 * Integration tests for HelpMakingACustomActionSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HelpCommand } from './help-command.js';
import { HelpMakingACustomActionSubCommand } from './help-making-a-custom-action-subcommand.js';

import {
	createTestHarness,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';

describe('HelpMakingACustomActionSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new HelpCommand([new HelpMakingACustomActionSubCommand()])]);
	});


	it('should respond with custom action walkthrough help', async () => {
		const result = await harness.executeCommand({
			commandName: 'help',
			subcommand: 'action-creation-walkthrough',
			options: {},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		expect(result.didRespond()).toBe(true);
	});
});
