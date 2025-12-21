/**
 * Integration tests for GameRollSubCommand
 *
 * This command rolls dice/actions/skills for game characters.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameDefinition } from '@kobold/documentation';
import { GameCommand } from './game-command.js';
import { GameRollSubCommand } from './game-roll-subcommand.js';

const opts = GameDefinition.commandOptionsEnum;
const optionChoices = GameDefinition.optionChoices;

import {
	createTestHarness,
	createMockCharacter,
	setupKoboldUtilsMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';
import { createMockGame } from './game-test-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');

describe('GameRollSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new GameCommand([new GameRollSubCommand()])]);
	});


	describe('Dice Rolling', () => {
		it('should respond when rolling dice for party characters', async () => {
			// Arrange
			const char1 = createMockCharacter({ characterOverrides: { name: 'Roller' } });
			const mockGame = createMockGame({ characters: [char1] });

			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({
				activeGame: mockGame,
				userSettings: {},
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'game',
				subcommand: 'roll',
				options: {
					[opts.gameRollType]: 'Dice',
					[opts.gameTargetCharacter]: 'All Players',
					[opts.gameDiceRollOrModifier]: '1d20',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should respond when rolling dice with modifiers', async () => {
			// Arrange
			const char1 = createMockCharacter({ characterOverrides: { name: 'Fighter' } });
			const mockGame = createMockGame({ characters: [char1] });

			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({
				activeGame: mockGame,
				userSettings: {},
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'game',
				subcommand: 'roll',
				options: {
					[opts.gameRollType]: 'Dice',
					[opts.gameTargetCharacter]: 'All Players',
					[opts.gameDiceRollOrModifier]: '2d6+5',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('Character Targeting', () => {
		it('should respond when rolling for all players', async () => {
			// Arrange
			const char1 = createMockCharacter({ characterOverrides: { name: 'Fighter', id: 1 } });
			const char2 = createMockCharacter({ characterOverrides: { name: 'Wizard', id: 2 } });
			const mockGame = createMockGame({ characters: [char1, char2] });

			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({
				activeGame: mockGame,
				userSettings: {},
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'game',
				subcommand: 'roll',
				options: {
					[opts.gameRollType]: 'Dice',
					[opts.gameTargetCharacter]: 'All Players',
					[opts.gameDiceRollOrModifier]: '1d20',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should respond when rolling for specific character', async () => {
			// Arrange
			const char1 = createMockCharacter({ characterOverrides: { name: 'Fighter', id: 1 } });
			const char2 = createMockCharacter({ characterOverrides: { name: 'Wizard', id: 2 } });
			const mockGame = createMockGame({ characters: [char1, char2] });

			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({
				activeGame: mockGame,
				userSettings: {},
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'game',
				subcommand: 'roll',
				options: {
					[opts.gameRollType]: 'Dice',
					[opts.gameTargetCharacter]: 'Fighter',
					[opts.gameDiceRollOrModifier]: '1d20',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('Empty Game Handling', () => {
		it('should respond with message when game has no characters', async () => {
			// Arrange
			const mockGame = createMockGame({ name: 'Empty Game', characters: [] });

			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({
				activeGame: mockGame,
				userSettings: {},
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'game',
				subcommand: 'roll',
				options: {
					[opts.gameRollType]: 'Dice',
					[opts.gameTargetCharacter]: 'All Players',
					[opts.gameDiceRollOrModifier]: '1d20',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(result.getResponseContent()).toContain('no characters');
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
				subcommand: 'roll',
				options: {
					[opts.gameRollType]: 'Dice',
					[opts.gameTargetCharacter]: 'All Players',
					[opts.gameDiceRollOrModifier]: '1d20',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('Secret Rolls', () => {
		it('should support secret rolls', async () => {
			// Arrange
			const char1 = createMockCharacter({ characterOverrides: { name: 'Sneaky' } });
			const mockGame = createMockGame({ characters: [char1] });

			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({
				activeGame: mockGame,
				userSettings: {},
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'game',
				subcommand: 'roll',
				options: {
					[opts.gameRollType]: 'Dice',
					[opts.gameTargetCharacter]: 'All Players',
					[opts.gameDiceRollOrModifier]: '1d20',
					'roll-secret': optionChoices.rollSecret.secret,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should support gm secret rolls', async () => {
			// Arrange
			const char1 = createMockCharacter({ characterOverrides: { name: 'GMSpy' } });
			const mockGame = createMockGame({ characters: [char1] });

			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({
				activeGame: mockGame,
				userSettings: {},
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'game',
				subcommand: 'roll',
				options: {
					[opts.gameRollType]: 'Dice',
					[opts.gameTargetCharacter]: 'All Players',
					[opts.gameDiceRollOrModifier]: '1d20',
					'roll-secret': optionChoices.rollSecret.sendToGm,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('Multiple Characters Rolling', () => {
		it('should respond when rolling for all characters in large party', async () => {
			// Arrange
			const characters = Array.from({ length: 5 }, (_, i) =>
				createMockCharacter({ characterOverrides: { name: `Hero ${i + 1}`, id: i + 1 } })
			);
			const mockGame = createMockGame({ characters });

			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({
				activeGame: mockGame,
				userSettings: {},
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'game',
				subcommand: 'roll',
				options: {
					[opts.gameRollType]: 'Dice',
					[opts.gameTargetCharacter]: 'All Players',
					[opts.gameDiceRollOrModifier]: '1d20+10',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});
});
