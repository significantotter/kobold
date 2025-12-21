/**
 * Integration tests for HelpFaqSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HelpCommand } from './help-command.js';
import { HelpFaqSubCommand } from './help-faq-subcommand.js';

import {
	createTestHarness,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';

describe('HelpFaqSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new HelpCommand([new HelpFaqSubCommand()])]);
	});


	it('should respond with FAQ information', async () => {
		const result = await harness.executeCommand({
			commandName: 'help',
			subcommand: 'faq',
			options: {},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		expect(result.didRespond()).toBe(true);
	});
});
