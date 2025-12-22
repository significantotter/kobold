/**
 * Integration tests for InitShowSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InitCommand } from './init-command.js';
import { InitShowSubCommand } from './init-show-subcommand.js';
import { createMockInitiativeWithActors, resetInitTestIds } from './init-test-utils.js';

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

describe('InitShowSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		resetInitTestIds();
		harness = createTestHarness([new InitCommand([new InitShowSubCommand()])]);
	});


	it('should show initiative when it exists', async () => {
		// Arrange
		const existingInit = createMockInitiativeWithActors(2, { currentRound: 1 });
		const { fetchNonNullableDataMock } = setupKoboldUtilsMocks();
		fetchNonNullableDataMock.mockResolvedValue({
			currentInitiative: existingInit,
			userSettings: {},
		});

		// Act
		const result = await harness.executeCommand({
			commandName: 'init',
			subcommand: 'show',
			options: {},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
			channelId: TEST_CHANNEL_ID,
		});

		// Assert
		expect(result.didRespond()).toBe(true);
	});

	it('should error when no initiative exists', async () => {
		// Arrange
		const { fetchNonNullableDataMock } = setupKoboldUtilsMocks();
		fetchNonNullableDataMock.mockRejectedValue(
			new KoboldError('Yip! You must be in an initiative to use this command.')
		);

		// Act
		const result = await harness.executeCommand({
			commandName: 'init',
			subcommand: 'show',
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
