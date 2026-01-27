/**
 * Integration tests for GameplaySetSubCommand
 *
 * This command sets various gameplay stats to specific values for a target character.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameplayDefinition } from '@kobold/documentation';
import { GameplayCommand } from './gameplay-command.js';
import { GameplaySetSubCommand } from './gameplay-set-subcommand.js';

const opts = GameplayDefinition.commandOptionsEnum;

import {
	createTestHarness,
	createMockCharacter,
	setupKoboldUtilsMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');

describe('GameplaySetSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new GameplayCommand([new GameplaySetSubCommand()])]);
	});

	describe('Setting HP', () => {
		it('should respond when setting hp', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({ characterOverrides: { name: 'Fighter' } });
			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({ activeCharacter: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'gameplay',
				subcommand: 'set',
				options: {
					[opts.targetCharacter]: 'Fighter',
					[opts.setOption]: 'hp',
					[opts.setValue]: 50,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should respond when setting hp to zero', async () => {
			// Arrange - Setting HP to 0 shows "They're down!" message
			const mockCharacter = createMockCharacter({ characterOverrides: { name: 'Warrior' } });
			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({ activeCharacter: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'gameplay',
				subcommand: 'set',
				options: {
					[opts.targetCharacter]: 'Warrior',
					[opts.setOption]: 'hp',
					[opts.setValue]: 0,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('Setting Temporary HP', () => {
		it('should respond when setting temp-hp', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({
				characterOverrides: { name: 'Barbarian' },
			});
			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({ activeCharacter: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'gameplay',
				subcommand: 'set',
				options: {
					[opts.targetCharacter]: 'Barbarian',
					[opts.setOption]: 'temp-hp',
					[opts.setValue]: 15,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('Setting Stamina', () => {
		it('should respond when setting stamina', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({ characterOverrides: { name: 'Champion' } });
			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({ activeCharacter: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'gameplay',
				subcommand: 'set',
				options: {
					[opts.targetCharacter]: 'Champion',
					[opts.setOption]: 'stamina',
					[opts.setValue]: 10,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('Setting Resolve', () => {
		it('should respond when setting resolve', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({ characterOverrides: { name: 'Paladin' } });
			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({ activeCharacter: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'gameplay',
				subcommand: 'set',
				options: {
					[opts.targetCharacter]: 'Paladin',
					[opts.setOption]: 'resolve',
					[opts.setValue]: 3,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('Setting Hero Points', () => {
		it('should respond when setting hero-points', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({ characterOverrides: { name: 'Rogue' } });
			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({ activeCharacter: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'gameplay',
				subcommand: 'set',
				options: {
					[opts.targetCharacter]: 'Rogue',
					[opts.setOption]: 'hero-points',
					[opts.setValue]: 2,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('Setting Focus Points', () => {
		it('should respond when setting focus-points', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({ characterOverrides: { name: 'Monk' } });
			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({ activeCharacter: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'gameplay',
				subcommand: 'set',
				options: {
					[opts.targetCharacter]: 'Monk',
					[opts.setOption]: 'focus-points',
					[opts.setValue]: 1,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('Error Handling', () => {
		it('should respond with error when target not found', async () => {
			// Arrange
			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockRejectedValue(new Error('Character not found'));

			// Act
			const result = await harness.executeCommand({
				commandName: 'gameplay',
				subcommand: 'set',
				options: {
					[opts.targetCharacter]: 'GhostCharacter',
					[opts.setOption]: 'hp',
					[opts.setValue]: 50,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});
});
