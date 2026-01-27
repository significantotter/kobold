/**
 * Integration tests for HelpAttributesAndTagsSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HelpCommand } from './help-command.js';
import { HelpAttributesAndTagsSubCommand } from './help-attributes-and-tags-subcommand.js';

import {
	createTestHarness,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';

describe('HelpAttributesAndTagsSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new HelpCommand([new HelpAttributesAndTagsSubCommand()])]);
	});


	it('should respond with attributes and tags help', async () => {
		const result = await harness.executeCommand({
			commandName: 'help',
			subcommand: 'attributes-and-tags',
			options: {},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		expect(result.didRespond()).toBe(true);
	});
});
