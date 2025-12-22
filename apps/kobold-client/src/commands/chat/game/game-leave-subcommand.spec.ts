/**
 * Unit tests for GameLeaveSubCommand
 */
import { describe, it, expect, beforeEach, vi, MockInstance } from 'vitest';
import { GameDefinition } from '@kobold/documentation';
import { GameCommand } from './game-command.js';
import { GameLeaveSubCommand } from './game-leave-subcommand.js';

const opts = GameDefinition.commandOptionsEnum;
const strings = GameDefinition.strings;

import {
	createTestHarness,
	createMockCharacter,
	setupKoboldUtilsMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
	getMockKobold,
	resetMockKobold,} from '../../../test-utils/index.js';
import { createMockGame } from './game-test-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');

describe('GameLeaveSubCommand', () => {
	const kobold = getMockKobold();

	let harness: CommandTestHarness;

	beforeEach(() => {
		resetMockKobold(kobold);
		harness = createTestHarness([new GameCommand([new GameLeaveSubCommand()])]);
	});

	it('should leave a game successfully', async () => {
		// Arrange
		const mockCharacter = createMockCharacter({
			characterOverrides: { id: 10, name: 'Hero' },
		});
		const targetGame = createMockGame({
			id: 5,
			name: 'Adventure',
			characters: [mockCharacter],
		});
		kobold.game.readMany.mockResolvedValue([targetGame]);
		kobold.character.update.mockResolvedValue(mockCharacter);

		const { fetchNonNullableDataMock } = setupKoboldUtilsMocks();
		fetchNonNullableDataMock.mockResolvedValue({ activeCharacter: mockCharacter });

		// Act
		const result = await harness.executeCommand({
			commandName: 'game',
			subcommand: 'leave',
			options: {
				[opts.gameTargetGame]: 'Adventure',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		// Assert
		expect(result.didRespond()).toBe(true);
		expect(result.getResponseContent()).toContain(
			strings.leave.success({ characterName: 'Hero', gameName: 'Adventure' })
		);
		expect(kobold.character.update).toHaveBeenCalledWith({ id: 10 }, { gameId: null });
	});

	it('should error when game not found', async () => {
		// Arrange
		kobold.game.readMany.mockResolvedValue([]);

		// Act
		const result = await harness.executeCommand({
			commandName: 'game',
			subcommand: 'leave',
			options: {
				[opts.gameTargetGame]: 'Nowhere Game',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		// Assert
		expect(result.didRespond()).toBe(true);
		expect(result.getResponseContent()).toContain(
			strings.notFound({ gameName: 'Nowhere Game' })
		);
	});

	it('should error when character not in game', async () => {
		// Arrange
		const mockCharacter = createMockCharacter({
			characterOverrides: { id: 10, name: 'Hero' },
		});
		const targetGame = createMockGame({
			id: 5,
			name: 'Adventure',
			characters: [], // Character not in game
		});
		kobold.game.readMany.mockResolvedValue([targetGame]);

		const { fetchNonNullableDataMock } = setupKoboldUtilsMocks();
		fetchNonNullableDataMock.mockResolvedValue({ activeCharacter: mockCharacter });

		// Act
		const result = await harness.executeCommand({
			commandName: 'game',
			subcommand: 'leave',
			options: {
				[opts.gameTargetGame]: 'Adventure',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		// Assert
		expect(result.didRespond()).toBe(true);
		expect(result.getResponseContent()).toContain(
			strings.leave.notInGame({ characterName: 'Hero', gameName: 'Adventure' })
		);
	});
});
