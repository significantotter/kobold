/**
 * Integration tests for InitRemoveSubCommand
 */
import { describe, it, expect, beforeEach, vi, MockInstance } from 'vitest';
import { vitestKobold } from '@kobold/db/test-utils';
import { InitDefinition } from '@kobold/documentation';
import { InitCommand } from './init-command.js';
import { InitRemoveSubCommand } from './init-remove-subcommand.js';
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

describe('InitRemoveSubCommand Integration', () => {
	let harness: CommandTestHarness;
	let initActorDeleteSpy: MockInstance;
	let initGroupDeleteSpy: MockInstance;

	beforeEach(() => {
		resetInitTestIds();
		harness = createTestHarness([new InitCommand([new InitRemoveSubCommand()])]);
		initActorDeleteSpy = vi.spyOn(vitestKobold.initiativeActor, 'delete');
		initGroupDeleteSpy = vi.spyOn(vitestKobold.initiativeActorGroup, 'delete');
	});


	it('should remove an actor from initiative', async () => {
		// Arrange
		const existingInit = createMockInitiativeWithActors(2, { currentRound: 1 });
		const { fetchDataMock } = setupKoboldUtilsMocks();
		fetchDataMock.mockResolvedValue({
			currentInitiative: existingInit,
			userSettings: {},
		});
		initActorDeleteSpy.mockResolvedValue(existingInit.actors[0]);
		initGroupDeleteSpy.mockResolvedValue(existingInit.actorGroups[0]);

		// Act
		const result = await harness.executeCommand({
			commandName: 'init',
			subcommand: 'remove',
			options: {
				[opts.initCharacter]: 'Actor 1',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
			channelId: TEST_CHANNEL_ID,
		});

		// Assert
		expect(result.didRespond()).toBe(true);
		expect(initActorDeleteSpy).toHaveBeenCalled();
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
			subcommand: 'remove',
			options: {
				[opts.initCharacter]: 'Actor 1',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
			channelId: TEST_CHANNEL_ID,
		});

		// Assert
		expect(result.didRespond()).toBe(true);
		expect(result.getResponseContent()).toContain('You must be in an initiative');
	});
});
