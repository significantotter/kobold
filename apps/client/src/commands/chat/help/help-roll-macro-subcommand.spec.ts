/**
 * Integration tests for HelpRollMacroSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HelpCommand } from './help-command.js';
import { HelpRollMacroSubCommand } from './help-roll-macro-subcommand.js';

import {
	createTestHarness,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';

describe('HelpRollMacroSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new HelpCommand([new HelpRollMacroSubCommand()])]);
	});


	it('should respond with roll macro help', async () => {
		const result = await harness.executeCommand({
			commandName: 'help',
			subcommand: 'roll-macro',
			options: {},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		expect(result.didRespond()).toBe(true);
	});
});
