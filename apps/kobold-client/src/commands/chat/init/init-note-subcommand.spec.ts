/**
 * Unit tests for InitNoteSubCommand
 */
import { describe, it, expect, beforeEach, vi, MockInstance } from 'vitest';
import { InitDefinition } from '@kobold/documentation';
import { InitCommand } from './init-command.js';
import { InitNoteSubCommand } from './init-note-subcommand.js';
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
	resetMockKobold,} from '../../../test-utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { KoboldError } from '../../../utils/KoboldError.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');

describe('InitNoteSubCommand', () => {
	const kobold = getMockKobold();

	let harness: CommandTestHarness;

	beforeEach(() => {
		resetMockKobold(kobold);
		resetInitTestIds();
		harness = createTestHarness([new InitCommand([new InitNoteSubCommand()])]);
	});

	it('should set a note on an actor', async () => {
		// Arrange
		const existingInit = createMockInitiativeWithActors(2);
		const { fetchNonNullableDataMock } = setupKoboldUtilsMocks();
		fetchNonNullableDataMock.mockResolvedValue({
			currentInitiative: existingInit,
			userSettings: {},
		});
		kobold.initiativeActor.update.mockResolvedValue({
			...existingInit.actors[0],
			note: 'Test note',
		});

		// Act
		const result = await harness.executeCommand({
			commandName: 'init',
			subcommand: 'note',
			options: {
				[opts.initCharacter]: 'Actor 1',
				[opts.initNote]: 'Test note',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
			channelId: TEST_CHANNEL_ID,
		});

		// Assert
		expect(result.didRespond()).toBe(true);
		expect(kobold.initiativeActor.update).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({ note: 'Test note' })
		);
	});

	it('should clear a note when given clear command', async () => {
		// Arrange
		const existingInit = createMockInitiativeWithActors(2);
		existingInit.actors[0].note = 'Existing note';
		const { fetchNonNullableDataMock } = setupKoboldUtilsMocks();
		fetchNonNullableDataMock.mockResolvedValue({
			currentInitiative: existingInit,
			userSettings: {},
		});
		kobold.initiativeActor.update.mockResolvedValue({
			...existingInit.actors[0],
			note: '',
		});

		// Act
		const result = await harness.executeCommand({
			commandName: 'init',
			subcommand: 'note',
			options: {
				[opts.initCharacter]: 'Actor 1',
				[opts.initNote]: 'clear',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
			channelId: TEST_CHANNEL_ID,
		});

		// Assert
		expect(result.didRespond()).toBe(true);
		expect(kobold.initiativeActor.update).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({ note: '' })
		);
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
			subcommand: 'note',
			options: {
				[opts.initCharacter]: 'Actor 1',
				[opts.initNote]: 'Test note',
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
