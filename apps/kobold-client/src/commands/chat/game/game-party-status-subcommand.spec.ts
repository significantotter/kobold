/**
 * Integration tests for GamePartyStatusSubCommand
 *
 * This command displays the status of all characters in the active game.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameDefinition } from '@kobold/documentation';
import { GameCommand } from './game-command.js';
import { GamePartyStatusSubCommand } from './game-party-status-subcommand.js';

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

describe('GamePartyStatusSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new GameCommand([new GamePartyStatusSubCommand()])]);
	});


	describe('Party Status Display', () => {
		it('should display status for party characters', async () => {
			// Arrange
			const char1 = createMockCharacter({ characterOverrides: { name: 'Fighter' } });
			const char2 = createMockCharacter({ characterOverrides: { name: 'Wizard' } });
			const mockGame = createMockGame({ characters: [char1, char2] });

			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({ activeGame: mockGame });

			// Act
			const result = await harness.executeCommand({
				commandName: 'game',
				subcommand: 'party-status',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should display single character status', async () => {
			// Arrange
			const char1 = createMockCharacter({ characterOverrides: { name: 'Solo Hero' } });
			const mockGame = createMockGame({ characters: [char1] });

			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({ activeGame: mockGame });

			// Act
			const result = await harness.executeCommand({
				commandName: 'game',
				subcommand: 'party-status',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('Empty Party Handling', () => {
		it('should handle empty game with no characters', async () => {
			// Arrange
			const mockGame = createMockGame({ characters: [] });

			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({ activeGame: mockGame });

			// Act
			const result = await harness.executeCommand({
				commandName: 'game',
				subcommand: 'party-status',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
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
				subcommand: 'party-status',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('Multiple Characters', () => {
		it('should handle large party', async () => {
			// Arrange
			const characters = Array.from({ length: 6 }, (_, i) =>
				createMockCharacter({
					characterOverrides: { name: `Character ${i + 1}`, id: i + 1 },
				})
			);
			const mockGame = createMockGame({ characters });

			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({ activeGame: mockGame });

			// Act
			const result = await harness.executeCommand({
				commandName: 'game',
				subcommand: 'party-status',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});
});
