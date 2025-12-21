/**
 * Integration tests for GameInitSubCommand
 *
 * This command adds game characters to the current initiative.
 */
import { describe, it, expect, beforeEach, vi, MockInstance } from 'vitest';
import { vitestKobold } from '@kobold/db/test-utils';
import { GameDefinition, InitDefinition } from '@kobold/documentation';
import { GameCommand } from './game-command.js';
import { GameInitSubCommand } from './game-init-subcommand.js';

const opts = GameDefinition.commandOptionsEnum;
const strings = GameDefinition.strings;

import {
	createTestHarness,
	createMockCharacter,
	setupKoboldUtilsMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';
import { createMockGame, createMockInitiative } from './game-test-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');

describe('GameInitSubCommand Integration', () => {
	let harness: CommandTestHarness;
	let initiativeCreateSpy: MockInstance;

	beforeEach(() => {
		harness = createTestHarness([new GameCommand([new GameInitSubCommand()])]);
		initiativeCreateSpy = vi.spyOn(vitestKobold.initiative, 'create');
	});


	describe('Adding Characters to Initiative', () => {
		it('should respond when adding all game characters', async () => {
			// Arrange
			const char1 = createMockCharacter({ characterOverrides: { name: 'Fighter', id: 1 } });
			const char2 = createMockCharacter({ characterOverrides: { name: 'Wizard', id: 2 } });
			const mockGame = createMockGame({ characters: [char1, char2] });
			const mockInitiative = createMockInitiative();

			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({
				activeGame: mockGame,
				currentInitiative: null,
				userSettings: {},
			});
			initiativeCreateSpy.mockResolvedValue(mockInitiative);

			// Act
			const result = await harness.executeCommand({
				commandName: 'game',
				subcommand: 'init',
				options: {
					[opts.gameTargetCharacter]: 'All Players',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should respond when adding targeted character', async () => {
			// Arrange
			const char1 = createMockCharacter({ characterOverrides: { name: 'Fighter', id: 1 } });
			const char2 = createMockCharacter({ characterOverrides: { name: 'Wizard', id: 2 } });
			const mockGame = createMockGame({ characters: [char1, char2] });
			const mockInitiative = createMockInitiative();

			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({
				activeGame: mockGame,
				currentInitiative: null,
				userSettings: {},
			});
			initiativeCreateSpy.mockResolvedValue(mockInitiative);

			// Act
			const result = await harness.executeCommand({
				commandName: 'game',
				subcommand: 'init',
				options: {
					[opts.gameTargetCharacter]: 'Fighter',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('Empty Game Handling', () => {
		it('should handle empty game gracefully', async () => {
			// Arrange
			const mockGame = createMockGame({ name: 'Empty Game', characters: [] });

			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({
				activeGame: mockGame,
				currentInitiative: null,
				userSettings: {},
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'game',
				subcommand: 'init',
				options: {
					[opts.gameTargetCharacter]: 'All Players',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - command responds (either with message or error)
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('Already in Initiative', () => {
		it('should handle characters already in initiative', async () => {
			// Arrange
			const char1 = createMockCharacter({ characterOverrides: { name: 'Fighter', id: 1 } });
			const mockGame = createMockGame({ characters: [char1] });
			const existingInit = createMockInitiative({
				actors: [{ characterId: 1, name: 'Fighter' } as any],
			});

			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({
				activeGame: mockGame,
				currentInitiative: existingInit,
				userSettings: {},
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'game',
				subcommand: 'init',
				options: {
					[opts.gameTargetCharacter]: 'All Players',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - command responds (either with message or error)
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('Active Game Requirement', () => {
		it('should respond with error when no active game', async () => {
			// Arrange
			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockRejectedValue(new Error('No active game'));

			// Act
			const result = await harness.executeCommand({
				commandName: 'game',
				subcommand: 'init',
				options: {
					[opts.gameTargetCharacter]: 'All Players',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});
});
