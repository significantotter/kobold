/**
 * Integration tests for HelpConditionSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HelpCommand } from './help-command.js';
import { HelpConditionSubCommand } from './help-condition-subcommand.js';

import {
	createTestHarness,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';

describe('HelpConditionSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new HelpCommand([new HelpConditionSubCommand()])]);
	});


	it('should respond with condition help', async () => {
		const result = await harness.executeCommand({
			commandName: 'help',
			subcommand: 'condition',
			options: {},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		expect(result.didRespond()).toBe(true);
	});
});
