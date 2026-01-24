/**
 * Unit tests for InitRemoveSubCommand
 */
import { describe, it, expect, beforeEach, vi, MockInstance } from 'vitest';
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
	getMockKobold,
	resetMockKobold,
} from '../../../test-utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { KoboldError } from '../../../utils/KoboldError.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');

describe('InitRemoveSubCommand', () => {
	const kobold = getMockKobold();

	let harness: CommandTestHarness;

	beforeEach(() => {
		resetMockKobold(kobold);
		resetInitTestIds();
		harness = createTestHarness([new InitCommand([new InitRemoveSubCommand()])]);
	});

	it('should remove an actor from initiative', async () => {
		vi.spyOn(console, 'warn').mockImplementation(() => {});

		// Arrange
		const existingInit = createMockInitiativeWithActors(2, { currentRound: 1 });
		const { fetchNonNullableDataMock } = setupKoboldUtilsMocks();
		fetchNonNullableDataMock.mockResolvedValue({
			currentInitiative: existingInit,
			userSettings: {},
		});
		kobold.initiativeActor.delete.mockResolvedValue(existingInit.actors[0]);
		kobold.initiativeActorGroup.delete.mockResolvedValue(existingInit.actorGroups[0]);

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
		expect(kobold.initiativeActor.delete).toHaveBeenCalled();
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
