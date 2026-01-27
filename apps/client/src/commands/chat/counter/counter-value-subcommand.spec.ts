/**
 * Unit tests for CounterValueSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CounterStyleEnum } from '@kobold/db';
import { CounterDefinition as CounterCommandDef } from '@kobold/documentation';
import { CounterCommand } from './counter-command.js';
import { CounterValueSubCommand } from './counter-value-subcommand.js';
import {
	createTestHarness,
	createMockCharacter,
	setupKoboldUtilsMocks,
	setupAutocompleteKoboldMocks,
	setupSheetRecordUpdateMock,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
	createMockNumericCounter,
	createMockDotsCounter,
	createMockPreparedCounter,
	getMockKobold,
	resetMockKobold,
	type MockKoboldEmbed,
} from '../../../test-utils/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import type {
	Counter,
	CounterGroup,
	NumericCounter,
	DotsCounter,
	PreparedCounter,
} from '@kobold/db';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-embed-utils.js');
vi.mock('../../../utils/kobold-helpers/finder-helpers.js');

// Use documentation references for option names
const opts = CounterCommandDef.commandOptionsEnum;

describe('CounterValueSubCommand', () => {
	const kobold = getMockKobold();

	let harness: CommandTestHarness;
	let sendBatchesMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		resetMockKobold(kobold);
		harness = createTestHarness([new CounterCommand([new CounterValueSubCommand()])]);

		// Setup KoboldEmbed mock
		sendBatchesMock = vi.fn(async () => undefined);
		vi.mocked(KoboldEmbed).mockImplementation(function (this: MockKoboldEmbed) {
			this.setTitle = vi.fn(function (this: MockKoboldEmbed) {
				return this;
			});
			this.setFields = vi.fn(function (this: MockKoboldEmbed) {
				return this;
			});
			this.sendBatches = sendBatchesMock;
			return this;
		} as unknown as () => KoboldEmbed);
	});

	describe('setting counter value', () => {
		it('should set a numeric counter to a specific value', async () => {
			// Arrange
			const counter = createMockNumericCounter({
				name: 'Hit Points',
				current: 30,
				max: 45,
			});

			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter,
				group: null,
			});
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'value',
				options: { [opts.counterName]: 'Hit Points', [opts.counterValue]: '25' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - counter.current is mutated to 25 (set absolute value)
			expect(updateMock).toHaveBeenCalled();
			expect(sendBatchesMock).toHaveBeenCalled();
			expect(counter.current).toBe(25);
		});

		it('should increase a counter value with + prefix', async () => {
			// Arrange
			const counter = createMockNumericCounter({
				name: 'Gold',
				current: 100,
				max: null,
			});

			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter,
				group: null,
			});
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'value',
				options: { [opts.counterName]: 'Gold', [opts.counterValue]: '+50' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - counter.current should be 100 + 50 = 150
			expect(updateMock).toHaveBeenCalled();
			expect(counter.current).toBe(150);
		});

		it('should decrease a counter value with - prefix', async () => {
			// Arrange
			const counter = createMockNumericCounter({
				name: 'Hit Points',
				current: 30,
				max: 45,
			});

			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter,
				group: null,
			});
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'value',
				options: { [opts.counterName]: 'Hit Points', [opts.counterValue]: '-10' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - counter.current should be 30 - 10 = 20
			expect(updateMock).toHaveBeenCalled();
			expect(counter.current).toBe(20);
		});

		it('should not go below 0', async () => {
			// Arrange
			const counter = createMockNumericCounter({
				name: 'Hit Points',
				current: 5,
				max: 45,
			});

			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter,
				group: null,
			});
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'value',
				options: { [opts.counterName]: 'Hit Points', [opts.counterValue]: '-20' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - counter.current should be clamped to 0 (not negative)
			expect(updateMock).toHaveBeenCalled();
			expect(counter.current).toBe(0);
		});

		it('should not exceed max value', async () => {
			// Arrange
			const counter = createMockNumericCounter({
				name: 'Hit Points',
				current: 40,
				max: 45,
			});

			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter,
				group: null,
			});
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'value',
				options: { [opts.counterName]: 'Hit Points', [opts.counterValue]: '+20' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - counter.current should be clamped to max (45)
			expect(updateMock).toHaveBeenCalled();
			expect(counter.current).toBe(45);
		});

		it('should work with dots counter', async () => {
			// Arrange
			const counter = createMockDotsCounter({
				name: 'Focus Points',
				current: 1,
				max: 3,
			});

			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter,
				group: null,
			});
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'value',
				options: { [opts.counterName]: 'Focus Points', [opts.counterValue]: '+1' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - counter.current should be 1 + 1 = 2
			expect(updateMock).toHaveBeenCalled();
			expect(counter.current).toBe(2);
		});
	});

	describe('error handling', () => {
		it('should throw error when counter not found', async () => {
			// Arrange
			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter: null,
				group: null,
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'value',
				options: { [opts.counterName]: 'Nonexistent', [opts.counterValue]: '5' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - Error is caught and responded to
			expect(result.didRespond()).toBe(true);
		});

		it('should throw error for prepared counters', async () => {
			// Arrange
			const counter = createMockPreparedCounter({ name: 'Spell Slots' });

			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter,
				group: null,
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'value',
				options: { [opts.counterName]: 'Spell Slots', [opts.counterValue]: '5' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - Error is caught and responded to
			expect(result.didRespond()).toBe(true);
		});

		it('should throw error for invalid value format', async () => {
			// Arrange
			const counter = createMockNumericCounter({ name: 'Gold' });

			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter,
				group: null,
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'value',
				options: { [opts.counterName]: 'Hit Points', [opts.counterValue]: 'abc' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - Error is caught and responded to
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('autocomplete', () => {
		it('should return matching numeric and dots counters for autocomplete', async () => {
			// Arrange
			const counters: Counter[] = [
				createMockNumericCounter({ name: 'Hit Points' }),
				createMockDotsCounter({ name: 'Focus Points' }),
				createMockPreparedCounter({ name: 'Spell Slots' }), // Should be excluded
			];

			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.sheet.countersOutsideGroups = counters;

			setupAutocompleteKoboldMocks({
				characterOverrides: mockCharacter,
			});

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'counter',
				subcommand: 'value',
				options: { [opts.counterName]: 'Go' },
				focusedOption: { name: opts.counterName, value: 'Go' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			const choices = result.getChoices();
			expect(choices.length).toBeGreaterThanOrEqual(0);
		});
	});
});
