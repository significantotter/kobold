/**
 * Integration tests for GameplayTrackerSubCommand
 *
 * This command creates or updates auto-updating stat tracker messages in Discord channels.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameplayDefinition } from '@kobold/documentation';
import { GameplayCommand } from './gameplay-command.js';
import { GameplayTrackerSubCommand } from './gameplay-tracker-subcommand.js';

const opts = GameplayDefinition.commandOptionsEnum;

import {
	createTestHarness,
	createMockCharacter,
	setupKoboldUtilsMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	TEST_CHANNEL_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');

describe('GameplayTrackerSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new GameplayCommand([new GameplayTrackerSubCommand()])]);
	});


	describe('Tracker Creation', () => {
		it('should respond when creating a basic tracker', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({
				characterOverrides: { name: 'TrackerChar' },
			});
			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({ activeCharacter: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'gameplay',
				subcommand: 'tracker',
				options: {
					[opts.gameplayTargetCharacter]: 'TrackerChar',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should respond when creating tracker for active character', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({
				characterOverrides: { name: 'ActiveTracker' },
			});
			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({ activeCharacter: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'gameplay',
				subcommand: 'tracker',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('Tracker Modes', () => {
		it('should respond when creating counters_only tracker', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({
				characterOverrides: { name: 'CountersChar' },
			});
			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({ activeCharacter: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'gameplay',
				subcommand: 'tracker',
				options: {
					[opts.gameplayTargetCharacter]: 'CountersChar',
					[opts.gameplayTrackerMode]: 'counters_only',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should respond when creating basic_stats tracker', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({
				characterOverrides: { name: 'BasicChar' },
			});
			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({ activeCharacter: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'gameplay',
				subcommand: 'tracker',
				options: {
					[opts.gameplayTargetCharacter]: 'BasicChar',
					[opts.gameplayTrackerMode]: 'basic_stats',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should respond when creating full_sheet tracker', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({
				characterOverrides: { name: 'FullSheetChar' },
			});
			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({ activeCharacter: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'gameplay',
				subcommand: 'tracker',
				options: {
					[opts.gameplayTargetCharacter]: 'FullSheetChar',
					[opts.gameplayTrackerMode]: 'full_sheet',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('Target Channel', () => {
		it('should respond when creating tracker in specific channel', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({
				characterOverrides: { name: 'ChannelChar' },
			});
			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({ activeCharacter: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'gameplay',
				subcommand: 'tracker',
				options: {
					[opts.gameplayTargetCharacter]: 'ChannelChar',
					[opts.gameplayTargetChannel]: TEST_CHANNEL_ID,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should respond when creating tracker with mode and channel', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({
				characterOverrides: { name: 'ModeChannelChar' },
			});
			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({ activeCharacter: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'gameplay',
				subcommand: 'tracker',
				options: {
					[opts.gameplayTargetCharacter]: 'ModeChannelChar',
					[opts.gameplayTrackerMode]: 'basic_stats',
					[opts.gameplayTargetChannel]: TEST_CHANNEL_ID,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('Tracker Updates', () => {
		it('should respond when updating existing tracker', async () => {
			// Arrange - Character with existing tracker
			const mockCharacter = createMockCharacter({
				characterOverrides: { name: 'ExistingTrackerChar' },
			});
			// Set tracker properties on the sheet record
			mockCharacter.sheetRecord.trackerMessageId = 'existing-tracker-123';
			mockCharacter.sheetRecord.trackerGuildId = TEST_GUILD_ID;
			mockCharacter.sheetRecord.trackerChannelId = TEST_CHANNEL_ID;

			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({ activeCharacter: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'gameplay',
				subcommand: 'tracker',
				options: {
					[opts.gameplayTargetCharacter]: 'ExistingTrackerChar',
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
				subcommand: 'tracker',
				options: {
					[opts.gameplayTargetCharacter]: 'MissingCharacter',
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
				subcommand: 'tracker',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});
});
