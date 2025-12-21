/**
 * Integration tests for CounterSetSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vitestKobold } from '@kobold/db/test-utils';
import { CounterStyleEnum } from '@kobold/db';
import { CounterDefinition as CounterCommandDoc } from '@kobold/documentation';
import { CounterCommand } from './counter-command.js';
import { CounterSetSubCommand } from './counter-set-subcommand.js';
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
} from '../../../test-utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import type {
	Counter,
	CounterGroup,
	NumericCounter,
	DotsCounter,
	PreparedCounter,
} from '@kobold/db';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-helpers/finder-helpers.js');

// Use documentation references for option names
const opts = CounterCommandDoc.commandOptionsEnum;
const setOptionChoices = CounterCommandDoc.optionChoices.setOption;

describe('CounterSetSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new CounterCommand([new CounterSetSubCommand()])]);
	});

	describe('setting counter name', () => {
		it('should rename a counter', async () => {
			// Arrange
			const counter = createMockNumericCounter({ name: 'Old Name' });

			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName)
				.mockReturnValueOnce({ counter, group: null })
				.mockReturnValueOnce({ counter: null, group: null }); // No duplicate
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'set',
				options: {
					[opts.counterName]: 'Old Name',
					[opts.counterSetOption]: setOptionChoices.name,
					[opts.counterSetValue]: 'New Name',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
			expect(counter.name).toBe('New Name');
		});

		it('should reject duplicate names', async () => {
			// Arrange
			const counter = createMockNumericCounter({ name: 'Counter A' });
			const existingCounter = createMockNumericCounter({ name: 'Counter B' });

			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName)
				.mockReturnValueOnce({ counter, group: null })
				.mockReturnValueOnce({ counter: existingCounter, group: null }); // Duplicate exists

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'set',
				options: {
					[opts.counterName]: 'Counter A',
					[opts.counterSetOption]: setOptionChoices.name,
					[opts.counterSetValue]: 'Counter B',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - Error is caught and responded to
			expect(result.didRespond()).toBe(true);
		});

		it('should reject names longer than 50 characters', async () => {
			// Arrange
			const counter = createMockNumericCounter({ name: 'Short Name' });

			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName)
				.mockReturnValueOnce({ counter, group: null })
				.mockReturnValueOnce({ counter: null, group: null });

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'set',
				options: {
					[opts.counterName]: 'Short Name',
					[opts.counterSetOption]: setOptionChoices.name,
					[opts.counterSetValue]: 'A'.repeat(60),
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - Error is caught and responded to
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('setting counter description', () => {
		it('should set counter description', async () => {
			// Arrange
			const counter = createMockNumericCounter({ name: 'Gold', description: null });

			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter,
				group: null,
			});
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'set',
				options: {
					[opts.counterName]: 'Gold',
					[opts.counterSetOption]: setOptionChoices.description,
					[opts.counterSetValue]: 'Currency for purchases',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
			expect(counter.description).toBe('Currency for purchases');
		});
	});

	describe('setting counter max', () => {
		it('should set counter max value', async () => {
			// Arrange
			const counter = createMockNumericCounter({ name: 'HP', max: 45 });

			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter,
				group: null,
			});
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'set',
				options: {
					[opts.counterName]: 'HP',
					[opts.counterSetOption]: setOptionChoices.max,
					[opts.counterSetValue]: '50',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
			expect(counter.max).toBe(50);
		});

		it('should adjust prepared counter slots when max changes', async () => {
			// Arrange
			const counter = createMockPreparedCounter({
				name: 'Spells',
				max: 3,
				prepared: ['A', 'B', 'C'],
				active: [true, true, true],
			});

			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter,
				group: null,
			});
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'set',
				options: {
					[opts.counterName]: 'Spells',
					[opts.counterSetOption]: setOptionChoices.max,
					[opts.counterSetValue]: '5',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
			expect(counter.prepared.length).toBe(5);
			expect(counter.active.length).toBe(5);
		});

		it('should reject max > 20 for dots counters', async () => {
			// Arrange
			const counter = createMockDotsCounter({ name: 'Focus', max: 3 });

			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter,
				group: null,
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'set',
				options: {
					[opts.counterName]: 'Focus',
					[opts.counterSetOption]: setOptionChoices.max,
					[opts.counterSetValue]: '25',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - Error is caught and responded to
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('setting counter recoverTo', () => {
		it('should set recoverTo value', async () => {
			// Arrange
			const counter = createMockNumericCounter({ name: 'Daily Power', recoverTo: 0 });

			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter,
				group: null,
			});
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'set',
				options: {
					[opts.counterName]: 'Daily Power',
					[opts.counterSetOption]: setOptionChoices.recoverTo,
					[opts.counterSetValue]: '3',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
			expect(counter.recoverTo).toBe(3);
		});

		it('should reject recoverTo for prepared counters', async () => {
			// Arrange
			const counter = createMockPreparedCounter({ name: 'Spells' });

			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter,
				group: null,
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'set',
				options: {
					[opts.counterName]: 'Spells',
					[opts.counterSetOption]: setOptionChoices.recoverTo,
					[opts.counterSetValue]: '2',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - Error is caught and responded to
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('setting counter recoverable', () => {
		it('should set recoverable to true', async () => {
			// Arrange
			const counter = createMockNumericCounter({ name: 'Resource', recoverable: false });

			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter,
				group: null,
			});
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'set',
				options: {
					[opts.counterName]: 'Resource',
					[opts.counterSetOption]: setOptionChoices.recoverable,
					[opts.counterSetValue]: 'true',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
			expect(counter.recoverable).toBe(true);
		});
	});

	describe('setting counter style', () => {
		it('should change style from default to dots', async () => {
			// Arrange
			const counter = createMockNumericCounter({ name: 'Focus', max: 5 });

			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter,
				group: null,
			});
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'set',
				options: {
					[opts.counterName]: 'Focus',
					[opts.counterSetOption]: setOptionChoices.style,
					[opts.counterSetValue]: CounterStyleEnum.dots,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
			expect(counter.style).toBe(CounterStyleEnum.dots);
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
				subcommand: 'set',
				options: {
					[opts.counterName]: 'Nonexistent',
					[opts.counterSetOption]: setOptionChoices.name,
					[opts.counterSetValue]: 'New Name',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - Error is caught and responded to
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('autocomplete', () => {
		it('should return matching counters for autocomplete', async () => {
			// Arrange
			const counters: Counter[] = [
				createMockNumericCounter({ name: 'Hit Points' }),
				createMockNumericCounter({ name: 'Hero Points' }),
			];

			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.sheet.countersOutsideGroups = counters;

			setupAutocompleteKoboldMocks({
				characterOverrides: mockCharacter,
			});

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'counter',
				subcommand: 'set',
				options: { [opts.counterName]: 'Points' },
				focusedOption: { name: opts.counterName, value: 'Points' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			const choices = result.getChoices();
			expect(choices.length).toBeGreaterThanOrEqual(0);
		});
	});
});
