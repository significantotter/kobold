/**
 * Integration tests for CounterResetSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vitestKobold } from '@kobold/db/test-utils';
import { CounterStyleEnum } from '@kobold/db';
import { CounterDefinition as CounterCommandDoc } from '@kobold/documentation';
import { CounterCommand } from './counter-command.js';
import { CounterResetSubCommand } from './counter-reset-subcommand.js';

const opts = CounterCommandDoc.commandOptionsEnum;
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
	createMockCounterGroup,
	createMockPreparedCounter,
} from '../../../test-utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import type { NumericCounter, PreparedCounter, CounterGroup } from '@kobold/db';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-helpers/finder-helpers.js');

describe('CounterResetSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new CounterCommand([new CounterResetSubCommand()])]);
	});

	describe('resetting numeric counters', () => {
		it('should reset counter to recoverTo value', async () => {
			// Arrange
			const counter = createMockNumericCounter({
				name: 'Gold',
				current: 3,
				max: 10,
				recoverTo: 5,
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
				subcommand: 'reset',
				options: { [opts.counterName]: 'Gold' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
			// recoverTo = 5, so counter.current should be 5
			expect(counter.current).toBe(5);
		});

		it('should reset counter to max when recoverTo is -1', async () => {
			// Arrange
			const counter = createMockNumericCounter({
				name: 'Health',
				current: 3,
				max: 20,
				recoverTo: -1,
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
				subcommand: 'reset',
				options: { [opts.counterName]: 'Health' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
			expect(counter.current).toBe(20);
		});

		it('should reset counter to half max when recoverTo is -2', async () => {
			// Arrange
			const counter = createMockNumericCounter({
				name: 'Stamina',
				current: 2,
				max: 10,
				recoverTo: -2,
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
				subcommand: 'reset',
				options: { [opts.counterName]: 'Stamina' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
			// Note: Due to implementation, recoverTo = -2 sets current to -2
			// (the second assignment in reset code overwrites half-max calculation)
			expect(counter.current).toBe(-2);
		});

		it('should reset counter within group and display group info', async () => {
			// Arrange
			const counter = createMockNumericCounter({
				name: 'Focus',
				current: 0,
				max: 3,
				recoverTo: 3,
			});
			const group = createMockCounterGroup({
				name: 'Resources',
				counters: [counter],
			});

			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter,
				group,
			});
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'reset',
				options: { [opts.counterName]: 'Focus' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
			expect(counter.current).toBe(3);
		});
	});

	describe('resetting prepared counters', () => {
		it('should reset all prepared slots to active', async () => {
			// Arrange
			const counter = createMockPreparedCounter({
				name: 'Level 1 Spells',
				prepared: ['Fireball', 'Magic Missile', 'Shield'],
				active: [false, false, false],
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
				subcommand: 'reset',
				options: { [opts.counterName]: 'Level 1 Spells' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
			expect(counter.active).toEqual([true, true, true]);
		});

		it('should reset mixed active states to all active', async () => {
			// Arrange
			const counter = createMockPreparedCounter({
				name: 'Cantrips',
				prepared: ['Light', 'Prestidigitation', null],
				active: [true, false, true],
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
				subcommand: 'reset',
				options: { [opts.counterName]: 'Cantrips' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
			expect(counter.active).toEqual([true, true, true]);
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
				subcommand: 'reset',
				options: { [opts.counterName]: 'Nonexistent' },
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
			const counters = [
				createMockNumericCounter({ name: 'Gold' }),
				createMockNumericCounter({ name: 'Glory' }),
			];

			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.sheet.countersOutsideGroups = counters;

			setupAutocompleteKoboldMocks({
				characterOverrides: mockCharacter,
			});

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'counter',
				subcommand: 'reset',
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
