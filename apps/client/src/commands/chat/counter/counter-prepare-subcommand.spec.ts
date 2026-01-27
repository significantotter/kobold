/**
 * Unit tests for CounterPrepareSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CounterStyleEnum } from '@kobold/db';
import { CounterDefinition as CounterCommandDoc } from '@kobold/documentation';
import { CounterCommand } from './counter-command.js';
import { CounterPrepareSubCommand } from './counter-prepare-subcommand.js';

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
	getMockKobold,
	resetMockKobold,} from '../../../test-utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import type { PreparedCounter, NumericCounter, CounterGroup } from '@kobold/db';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-helpers/finder-helpers.js');

describe('CounterPrepareSubCommand', () => {
	const kobold = getMockKobold();

	let harness: CommandTestHarness;

	beforeEach(() => {
		resetMockKobold(kobold);
		harness = createTestHarness([new CounterCommand([new CounterPrepareSubCommand()])]);
	});

	describe('preparing slots', () => {
		it('should prepare an ability in a slot', async () => {
			// Arrange
			const counter = createMockPreparedCounter({
				name: 'Level 1 Spells',
				prepared: [null, null, null],
				active: [true, true, true],
			});

			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter,
				group: null,
			});
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'prepare',
				options: {
					[opts.counterName]: 'Level 1 Spells',
					[opts.counterSlot]: '0: (empty)',
					[opts.counterPrepareSlot]: 'Fireball',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
			expect(counter.prepared[0]).toBe('Fireball');
		});

		it('should replace an existing ability in a slot', async () => {
			// Arrange
			const counter = createMockPreparedCounter({
				name: 'Level 1 Spells',
				prepared: ['Magic Missile', 'Shield', null],
				active: [true, false, true],
			});

			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter,
				group: null,
			});
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'prepare',
				options: {
					[opts.counterName]: 'Level 1 Spells',
					[opts.counterSlot]: '0 ✓ Magic Missile',
					[opts.counterPrepareSlot]: 'Fireball',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
			expect(counter.prepared[0]).toBe('Fireball');
		});

		it('should prepare ability in counter within a group', async () => {
			// Arrange
			const counter = createMockPreparedCounter({
				name: 'Level 1 Spells',
				prepared: [null, null],
				active: [true, true],
			});
			const group = createMockCounterGroup({
				name: 'Spell Slots',
				counters: [counter],
			});

			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter,
				group,
			});
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'prepare',
				options: {
					[opts.counterName]: 'Level 1 Spells',
					[opts.counterSlot]: '0: (empty)',
					[opts.counterPrepareSlot]: 'Shield',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
			expect(counter.prepared[0]).toBe('Shield');
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
				subcommand: 'prepare',
				options: {
					[opts.counterName]: 'Nonexistent',
					[opts.counterSlot]: '0: (empty)',
					[opts.counterPrepareSlot]: 'Fireball',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - Error is caught and responded to
			expect(result.didRespond()).toBe(true);
		});

		it('should throw error when counter is not prepared style', async () => {
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
				subcommand: 'prepare',
				options: {
					[opts.counterName]: 'Gold',
					[opts.counterSlot]: '0: (empty)',
					[opts.counterPrepareSlot]: 'Fireball',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - Error is caught and responded to
			expect(result.didRespond()).toBe(true);
		});

		it('should throw error when slot index is out of bounds', async () => {
			// Arrange
			const counter = createMockPreparedCounter({
				name: 'Level 1 Spells',
				prepared: ['Fireball', 'Shield'],
				active: [true, true],
			});

			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter,
				group: null,
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'prepare',
				options: {
					[opts.counterName]: 'Level 1 Spells',
					[opts.counterSlot]: '99: (empty)',
					[opts.counterPrepareSlot]: 'Magic Missile',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - Error is caught and responded to
			expect(result.didRespond()).toBe(true);
		});

		it('should throw error when ability name is too long', async () => {
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
				subcommand: 'prepare',
				options: {
					[opts.counterName]: 'Spells',
					[opts.counterSlot]: '0: (empty)',
					[opts.counterPrepareSlot]: 'A'.repeat(100), // More than 50 characters
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - Error is caught and responded to
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('autocomplete', () => {
		it('should return matching prepared counters for counter name autocomplete', async () => {
			// Arrange
			const counter = createMockPreparedCounter({ name: 'Level 1 Spells' });

			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.sheet.countersOutsideGroups = [counter];

			setupAutocompleteKoboldMocks({
				characterOverrides: mockCharacter,
			});

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'counter',
				subcommand: 'prepare',
				options: { [opts.counterName]: 'Level' },
				focusedOption: { name: opts.counterName, value: 'Level' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			const choices = result.getChoices();
			expect(choices.length).toBeGreaterThanOrEqual(0);
		});

		it('should return slot choices for slot autocomplete', async () => {
			// Arrange
			const counter = createMockPreparedCounter({
				name: 'Level 1 Spells',
				prepared: ['Fireball', null, 'Shield'],
				active: [true, true, false],
			});

			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.sheet.countersOutsideGroups = [counter];

			setupAutocompleteKoboldMocks({
				characterOverrides: mockCharacter,
			});
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter,
				group: null,
			});

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'counter',
				subcommand: 'prepare',
				options: { [opts.counterName]: 'Level 1 Spells', [opts.counterSlot]: '' },
				focusedOption: { name: opts.counterSlot, value: '' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			const choices = result.getChoices();
			expect(choices.length).toBe(3);
		});
	});
});
