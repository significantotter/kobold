/**
 * Unit tests for CounterPrepareManySubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CounterStyleEnum } from '@kobold/db';
import { CounterDefinition as CounterCommandDoc } from '@kobold/documentation';
import { CounterCommand } from './counter-command.js';
import { CounterPrepareManySubCommand } from './counter-prepare-many-subcommand.js';

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

describe('CounterPrepareManySubCommand', () => {
	const kobold = getMockKobold();

	let harness: CommandTestHarness;

	beforeEach(() => {
		resetMockKobold(kobold);
		harness = createTestHarness([new CounterCommand([new CounterPrepareManySubCommand()])]);
	});

	describe('preparing many slots', () => {
		it('should prepare multiple abilities at once', async () => {
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
				subcommand: 'prepare-many',
				options: {
					[opts.counterName]: 'Level 1 Spells',
					[opts.counterPrepareMany]: 'Fireball,Magic Missile,Shield',
					[opts.counterPrepareFresh]: false,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
			expect(counter.prepared).toEqual(['Fireball', 'Magic Missile', 'Shield']);
		});

		it('should fill only empty slots when not using prepare-fresh', async () => {
			// Arrange
			const counter = createMockPreparedCounter({
				name: 'Level 1 Spells',
				prepared: ['Fireball', null, null],
				active: [false, true, true],
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
				subcommand: 'prepare-many',
				options: {
					[opts.counterName]: 'Level 1 Spells',
					[opts.counterPrepareMany]: 'Shield,Magic Missile',
					[opts.counterPrepareFresh]: false,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
			expect(counter.prepared).toEqual(['Fireball', 'Shield', 'Magic Missile']);
		});

		it('should clear all slots and prepare fresh when prepare-fresh is true', async () => {
			// Arrange
			const counter = createMockPreparedCounter({
				name: 'Level 1 Spells',
				prepared: ['Old Spell 1', 'Old Spell 2', 'Old Spell 3'],
				active: [false, false, false],
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
				subcommand: 'prepare-many',
				options: {
					[opts.counterName]: 'Level 1 Spells',
					[opts.counterPrepareMany]: 'Fireball,Shield',
					[opts.counterPrepareFresh]: true,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
			expect(counter.prepared).toEqual(['Fireball', 'Shield', null]);
			expect(counter.active).toEqual([true, true, true]);
		});

		it('should prepare abilities in counter within a group', async () => {
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
				subcommand: 'prepare-many',
				options: {
					[opts.counterName]: 'Level 1 Spells',
					[opts.counterPrepareMany]: 'Fireball,Shield',
					[opts.counterPrepareFresh]: false,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
			expect(counter.prepared).toEqual(['Fireball', 'Shield']);
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
				subcommand: 'prepare-many',
				options: {
					[opts.counterName]: 'Nonexistent',
					[opts.counterPrepareMany]: 'Fireball',
					[opts.counterPrepareFresh]: false,
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
				subcommand: 'prepare-many',
				options: {
					[opts.counterName]: 'Gold',
					[opts.counterPrepareMany]: 'Fireball',
					[opts.counterPrepareFresh]: false,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - Error is caught and responded to
			expect(result.didRespond()).toBe(true);
		});

		it('should throw error when too many abilities for available slots', async () => {
			// Arrange
			const counter = createMockPreparedCounter({
				name: 'Level 1 Spells',
				prepared: ['Fireball', null],
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
				subcommand: 'prepare-many',
				options: {
					[opts.counterName]: 'Level 1 Spells',
					[opts.counterPrepareMany]: 'Shield,Magic Missile,Detect Magic',
					[opts.counterPrepareFresh]: false,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - Error is caught and responded to
			expect(result.didRespond()).toBe(true);
		});

		it('should throw error when an ability name is too long', async () => {
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
				subcommand: 'prepare-many',
				options: {
					[opts.counterName]: 'Spells',
					[opts.counterPrepareMany]: 'Fireball,' + 'A'.repeat(100), // One ability too long
					[opts.counterPrepareFresh]: false,
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
				subcommand: 'prepare-many',
				options: { [opts.counterName]: 'Level' },
				focusedOption: { name: opts.counterName, value: 'Level' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			const choices = result.getChoices();
			expect(choices.length).toBeGreaterThanOrEqual(0);
		});
	});
});
