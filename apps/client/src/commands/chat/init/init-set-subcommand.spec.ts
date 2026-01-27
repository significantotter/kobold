/**
 * Unit tests for InitSetSubCommand
 */
import { describe, it, expect, beforeEach, vi, MockInstance } from 'vitest';
import { InitDefinition } from '@kobold/documentation';
import { InitCommand } from './init-command.js';
import { InitSetSubCommand } from './init-set-subcommand.js';
import { createMockInitiativeWithActors, resetInitTestIds } from './init-test-utils.js';

const opts = InitDefinition.commandOptionsEnum;
const strings = InitDefinition.strings;

import {
	createTestHarness,
	setupKoboldUtilsMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	TEST_CHANNEL_ID,
	CommandTestHarness,
	getMockKobold,
	resetMockKobold,} from '../../../test-utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { KoboldError } from '../../../utils/KoboldError.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');

describe('InitSetSubCommand', () => {
	const kobold = getMockKobold();

	let harness: CommandTestHarness;

	beforeEach(() => {
		resetMockKobold(kobold);
		resetInitTestIds();
		harness = createTestHarness([new InitCommand([new InitSetSubCommand()])]);
	});

	it('should set initiative value for an actor', async () => {
		// Arrange
		const existingInit = createMockInitiativeWithActors(2);
		const { fetchNonNullableDataMock } = setupKoboldUtilsMocks();
		fetchNonNullableDataMock.mockResolvedValue({
			currentInitiative: existingInit,
			userSettings: {},
		});
		kobold.initiativeActorGroup.update.mockResolvedValue({
			...existingInit.actorGroups[0],
			initiativeResult: 25,
		});

		// Act
		const result = await harness.executeCommand({
			commandName: 'init',
			subcommand: 'set',
			options: {
				[opts.initCharacter]: 'Actor 1',
				[opts.initSetOption]: 'initiative',
				[opts.initSetValue]: '25',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
			channelId: TEST_CHANNEL_ID,
		});

		// Assert
		expect(result.didRespond()).toBe(true);
		expect(kobold.initiativeActorGroup.update).toHaveBeenCalled();
	});

	it('should error with invalid set option', async () => {
		// Arrange
		const existingInit = createMockInitiativeWithActors(2);
		const { fetchNonNullableDataMock } = setupKoboldUtilsMocks();
		fetchNonNullableDataMock.mockResolvedValue({
			currentInitiative: existingInit,
			userSettings: {},
		});

		// Act
		const result = await harness.executeCommand({
			commandName: 'init',
			subcommand: 'set',
			options: {
				[opts.initCharacter]: 'Actor 1',
				[opts.initSetOption]: 'invalid-option',
				[opts.initSetValue]: 'value',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
			channelId: TEST_CHANNEL_ID,
		});

		// Assert
		expect(result.didRespond()).toBe(true);
		expect(result.getResponseContent()).toContain(strings.set.invalidOptionError);
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
			subcommand: 'set',
			options: {
				[opts.initCharacter]: 'Actor 1',
				[opts.initSetOption]: 'initiative',
				[opts.initSetValue]: '25',
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
