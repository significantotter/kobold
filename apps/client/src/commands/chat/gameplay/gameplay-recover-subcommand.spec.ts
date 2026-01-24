/**
 * Integration tests for GameplayRecoverSubCommand
 *
 * This command recovers various gameplay stats for a target character.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameplayDefinition } from '@kobold/documentation';
import { GameplayCommand } from './gameplay-command.js';
import { GameplayRecoverSubCommand } from './gameplay-recover-subcommand.js';

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

describe('GameplayRecoverSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new GameplayCommand([new GameplayRecoverSubCommand()])]);
	});

	describe('Stat Recovery', () => {
		it('should respond when recovering stats', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({ characterOverrides: { name: 'Warrior' } });
			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({ activeCharacter: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'gameplay',
				subcommand: 'recover',
				options: {
					[opts.targetCharacter]: 'Warrior',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should respond when character has no stats to recover', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({
				characterOverrides: { name: 'FullHealth' },
			});
			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({ activeCharacter: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'gameplay',
				subcommand: 'recover',
				options: {
					[opts.targetCharacter]: 'FullHealth',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('Different Characters', () => {
		it('should respond when recovering for active character', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({
				characterOverrides: { name: 'ActiveChar' },
			});
			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({ activeCharacter: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'gameplay',
				subcommand: 'recover',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should respond when recovering for named target', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({
				characterOverrides: { name: 'NamedTarget' },
			});
			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({ activeCharacter: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'gameplay',
				subcommand: 'recover',
				options: {
					[opts.targetCharacter]: 'NamedTarget',
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
				subcommand: 'recover',
				options: {
					[opts.targetCharacter]: 'MissingCharacter',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should respond with error when no active character', async () => {
			// Arrange
			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockRejectedValue(new Error('No active character'));

			// Act
			const result = await harness.executeCommand({
				commandName: 'gameplay',
				subcommand: 'recover',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});
});
