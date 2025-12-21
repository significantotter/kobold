/**
 * Integration tests for InitStartSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InitCommand } from './init-command.js';
import { InitStartSubCommand } from './init-start-subcommand.js';
import { createMockInitiative, resetInitTestIds } from './init-test-utils.js';

import {
	createTestHarness,
	setupKoboldUtilsMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	TEST_CHANNEL_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');

describe('InitStartSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		resetInitTestIds();
		harness = createTestHarness([new InitCommand([new InitStartSubCommand()])]);
	});


	it('should error when initiative already exists in channel', async () => {
		// Arrange
		const existingInit = createMockInitiative();
		const { fetchDataMock } = setupKoboldUtilsMocks();
		fetchDataMock.mockResolvedValue({
			currentInitiative: existingInit,
			userSettings: {},
		});

		// Act
		const result = await harness.executeCommand({
			commandName: 'init',
			subcommand: 'start',
			options: {},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
			channelId: TEST_CHANNEL_ID,
		});

		// Assert
		expect(result.didRespond()).toBe(true);
		expect(result.getResponseContent()).toContain('You can only start initiative in');
	});
});
