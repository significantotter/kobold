/**
 * Integration tests for InitPrevSubCommand
 */
import { describe, it, expect, beforeEach, vi, MockInstance } from 'vitest';
import { vitestKobold } from '@kobold/db/test-utils';
import { InitCommand } from './init-command.js';
import { InitPrevSubCommand } from './init-prev-subcommand.js';
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

describe('InitPrevSubCommand Integration', () => {
	let harness: CommandTestHarness;
	let initUpdateSpy: MockInstance;

	beforeEach(() => {
		resetInitTestIds();
		harness = createTestHarness([new InitCommand([new InitPrevSubCommand()])]);
		initUpdateSpy = vi.spyOn(vitestKobold.initiative, 'update');
	});


	it('should go to the previous turn', async () => {
		// Arrange
		const existingInit = createMockInitiativeWithActors(2, { currentRound: 1 });
		existingInit.currentTurnGroupId = existingInit.actorGroups[1].id;
		const { fetchDataMock } = setupKoboldUtilsMocks();
		fetchDataMock.mockResolvedValue({
			currentInitiative: existingInit,
			userSettings: {},
		});
		initUpdateSpy.mockResolvedValue({
			...existingInit,
			currentTurnGroupId: existingInit.actorGroups[0].id,
		});

		// Act
		const result = await harness.executeCommand({
			commandName: 'init',
			subcommand: 'prev',
			options: {},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
			channelId: TEST_CHANNEL_ID,
		});

		// Assert
		expect(result.didRespond()).toBe(true);
		expect(initUpdateSpy).toHaveBeenCalled();
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
			subcommand: 'prev',
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
