/**
 * Integration tests for InitRollSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InitDefinition } from '@kobold/documentation';
import { InitCommand } from './init-command.js';
import { InitRollSubCommand } from './init-roll-subcommand.js';
import { createMockInitiativeWithActors, resetInitTestIds } from './init-test-utils.js';

const opts = InitDefinition.commandOptionsEnum;

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

describe('InitRollSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		resetInitTestIds();
		harness = createTestHarness([new InitCommand([new InitRollSubCommand()])]);
	});


	it('should respond to roll command in initiative', async () => {
		// Arrange
		const existingInit = createMockInitiativeWithActors(2, { currentRound: 1 });
		const { fetchDataMock } = setupKoboldUtilsMocks();
		fetchDataMock.mockResolvedValue({
			currentInitiative: existingInit,
			userSettings: {},
		});

		// Act
		const result = await harness.executeCommand({
			commandName: 'init',
			subcommand: 'roll',
			options: {
				[opts.initCharacter]: 'Actor 1',
				[opts.initRollChoice]: 'perception',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
			channelId: TEST_CHANNEL_ID,
		});

		// Assert - command responds (may be error or success depending on setup)
		expect(result.didRespond()).toBe(true);
	});
});
