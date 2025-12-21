/**
 * Integration tests for InitEndSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InitCommand } from './init-command.js';
import { InitEndSubCommand } from './init-end-subcommand.js';
import { resetInitTestIds } from './init-test-utils.js';

import {
	createTestHarness,
	setupKoboldUtilsMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	TEST_CHANNEL_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { KoboldError } from '../../../utils/KoboldError.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');

describe('InitEndSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		resetInitTestIds();
		harness = createTestHarness([new InitCommand([new InitEndSubCommand()])]);
	});


	it('should error when no initiative exists', async () => {
		// Arrange
		const { fetchDataMock } = setupKoboldUtilsMocks();
		fetchDataMock.mockRejectedValue(
			new KoboldError('Yip! You must be in an initiative to use this command.')
		);

		// Act
		const result = await harness.executeCommand({
			commandName: 'init',
			subcommand: 'end',
			options: {},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
			channelId: TEST_CHANNEL_ID,
		});

		// Assert
		expect(result.didRespond()).toBe(true);
		expect(result.getResponseContent()).toContain('You must be in an initiative');
	});
});
