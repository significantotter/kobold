/**
 * Integration tests for GameGiveSubCommand
 *
 * This command allows the GM to give stats (hp, tempHp, stamina, resolve)
 * to all characters in the active game.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameDefinition } from '@kobold/documentation';
import { GameCommand } from './game-command.js';
import { GameGiveSubCommand } from './game-give-subcommand.js';

const opts = GameDefinition.commandOptionsEnum;

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

describe('GameGiveSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new GameCommand([new GameGiveSubCommand()])]);
	});

	describe('Give Operations', () => {
		it('should respond when giving temporary hit points', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({ characterOverrides: { name: 'Tank' } });
			const mockGame = createMockGame({ characters: [mockCharacter] });
			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({ activeGame: mockGame });

			// Act
			const result = await harness.executeCommand({
				commandName: 'game',
				subcommand: 'give',
				options: {
					[opts.giveOption]: 'tempHp',
					[opts.giveAmount]: '10',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should respond when giving hp', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({ characterOverrides: { name: 'Healer' } });
			const mockGame = createMockGame({ characters: [mockCharacter] });
			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({ activeGame: mockGame });

			// Act
			const result = await harness.executeCommand({
				commandName: 'game',
				subcommand: 'give',
				options: {
					[opts.giveOption]: 'hp',
					[opts.giveAmount]: '20',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should respond when giving stamina', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({ characterOverrides: { name: 'Fighter' } });
			const mockGame = createMockGame({ characters: [mockCharacter] });
			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({ activeGame: mockGame });

			// Act
			const result = await harness.executeCommand({
				commandName: 'game',
				subcommand: 'give',
				options: {
					[opts.giveOption]: 'stamina',
					[opts.giveAmount]: '15',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should respond when giving resolve', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({ characterOverrides: { name: 'Cleric' } });
			const mockGame = createMockGame({ characters: [mockCharacter] });
			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({ activeGame: mockGame });

			// Act
			const result = await harness.executeCommand({
				commandName: 'game',
				subcommand: 'give',
				options: {
					[opts.giveOption]: 'resolve',
					[opts.giveAmount]: '5',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('Active Game Requirement', () => {
		it('should respond with error when no active game', async () => {
			// Arrange - no mock setup means error will be thrown
			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockRejectedValue(new Error('No active game'));

			// Act
			const result = await harness.executeCommand({
				commandName: 'game',
				subcommand: 'give',
				options: {
					[opts.giveOption]: 'hp',
					[opts.giveAmount]: '10',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('Multiple Characters', () => {
		it('should handle game with multiple characters', async () => {
			// Arrange
			const character1 = createMockCharacter({ characterOverrides: { name: 'Alice' } });
			const character2 = createMockCharacter({ characterOverrides: { name: 'Bob' } });
			const character3 = createMockCharacter({ characterOverrides: { name: 'Charlie' } });
			const mockGame = createMockGame({
				characters: [character1, character2, character3],
			});
			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({ activeGame: mockGame });

			// Act
			const result = await harness.executeCommand({
				commandName: 'game',
				subcommand: 'give',
				options: {
					[opts.giveOption]: 'tempHp',
					[opts.giveAmount]: '25',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});
});
