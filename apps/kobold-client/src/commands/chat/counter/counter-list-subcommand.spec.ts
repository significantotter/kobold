/**
 * Integration tests for CounterListSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CounterCommand } from './counter-command.js';
import { CounterListSubCommand } from './counter-list-subcommand.js';
import {
	createTestHarness,
	createMockCharacter,
	setupKoboldUtilsMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
	createMockNumericCounter,
	createMockCounterGroup,
	createMockDotsCounter,
	createMockPreparedCounter,
} from '../../../test-utils/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import type { Counter } from '@kobold/db';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-embed-utils.js');

describe('CounterListSubCommand Integration', () => {
	let harness: CommandTestHarness;
	let sendBatchesMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		harness = createTestHarness([new CounterCommand([new CounterListSubCommand()])]);

		// Setup KoboldEmbed mock
		sendBatchesMock = vi.fn().mockResolvedValue(undefined);
		vi.mocked(KoboldEmbed).mockImplementation(
			() =>
				({
					setCharacter: vi.fn().mockReturnThis(),
					setTitle: vi.fn().mockReturnThis(),
					setFields: vi.fn().mockReturnThis(),
					sendBatches: sendBatchesMock,
				}) as unknown as KoboldEmbed
		);
	});

	describe('listing counters', () => {
		it('should list all counters for a character', async () => {
			// Arrange
			const counters: Counter[] = [
				createMockNumericCounter({ name: 'Hit Points', current: 30, max: 45 }),
				createMockDotsCounter({ name: 'Focus Points', current: 2, max: 3 }),
			];

			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.sheet.countersOutsideGroups = counters;
			mockCharacter.sheetRecord.sheet.counterGroups = [];

			setupKoboldUtilsMocks({
				characterOverrides: mockCharacter,
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(false); // Uses sendBatches, not standard reply
			expect(sendBatchesMock).toHaveBeenCalled();
		});

		it('should handle character with no counters', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.sheet.countersOutsideGroups = [];
			mockCharacter.sheetRecord.sheet.counterGroups = [];

			setupKoboldUtilsMocks({
				characterOverrides: mockCharacter,
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(sendBatchesMock).toHaveBeenCalled();
		});

		it('should list counters in groups when not hiding groups', async () => {
			// Arrange
			const group = createMockCounterGroup({
				name: 'Spell Slots',
				counters: [
					createMockNumericCounter({ name: 'Level 1', current: 3, max: 4 }),
					createMockNumericCounter({ name: 'Level 2', current: 2, max: 3 }),
				],
			});

			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.sheet.counterGroups = [group];
			mockCharacter.sheetRecord.sheet.countersOutsideGroups = [];

			setupKoboldUtilsMocks({
				characterOverrides: mockCharacter,
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'list',
				options: { 'hide-groups': false },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(sendBatchesMock).toHaveBeenCalled();
		});

		it('should hide groups when hide-groups option is true', async () => {
			// Arrange
			const group = createMockCounterGroup({
				name: 'Hidden Group',
				counters: [createMockNumericCounter({ name: 'Hidden Counter' })],
			});

			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.sheet.counterGroups = [group];
			mockCharacter.sheetRecord.sheet.countersOutsideGroups = [
				createMockNumericCounter({ name: 'Visible Counter' }),
			];

			setupKoboldUtilsMocks({
				characterOverrides: mockCharacter,
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'list',
				options: { 'hide-groups': true },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(sendBatchesMock).toHaveBeenCalled();
		});

		it('should handle mixed counter types', async () => {
			// Arrange
			const counters: Counter[] = [
				createMockNumericCounter({ name: 'Gold' }),
				createMockDotsCounter({ name: 'Focus' }),
				createMockPreparedCounter({ name: 'Spells' }),
			];

			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.sheet.countersOutsideGroups = counters;
			mockCharacter.sheetRecord.sheet.counterGroups = [];

			setupKoboldUtilsMocks({
				characterOverrides: mockCharacter,
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(sendBatchesMock).toHaveBeenCalled();
		});
	});
});
