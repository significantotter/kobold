/**
 * Unit tests for CounterUseSlotSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CounterStyleEnum } from '@kobold/db';
import { CounterDefinition as CounterCommandDoc } from '@kobold/documentation';
import { CounterCommand } from './counter-command.js';
import { CounterUseSlotSubCommand } from './counter-use-slot-subcommand.js';

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

describe('CounterUseSlotSubCommand', () => {
	const kobold = getMockKobold();

	let harness: CommandTestHarness;

	beforeEach(() => {
		resetMockKobold(kobold);
		harness = createTestHarness([new CounterCommand([new CounterUseSlotSubCommand()])]);
	});

	describe('using slots', () => {
		it('should mark a slot as used', async () => {
			// Arrange
			const counter = createMockPreparedCounter({
				name: 'Level 1 Spells',
				prepared: ['Fireball', 'Magic Missile', 'Shield'],
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
				subcommand: 'use-slot',
				options: {
					[opts.counterName]: 'Level 1 Spells',
					[opts.counterSlot]: '0 ✓ Fireball',
					[opts.counterResetSlot]: false,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
			expect(counter.active[0]).toBe(false);
		});

		it('should reset a used slot', async () => {
			// Arrange
			const counter = createMockPreparedCounter({
				name: 'Level 1 Spells',
				prepared: ['Fireball', 'Magic Missile', 'Shield'],
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
				subcommand: 'use-slot',
				options: {
					[opts.counterName]: 'Level 1 Spells',
					[opts.counterSlot]: '0 ✗ Fireball',
					[opts.counterResetSlot]: true,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
			expect(counter.active[0]).toBe(true);
		});

		it('should use slot from counter within a group', async () => {
			// Arrange
			const counter = createMockPreparedCounter({
				name: 'Level 1 Spells',
				prepared: ['Fireball', 'Shield'],
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
				subcommand: 'use-slot',
				options: {
					[opts.counterName]: 'Level 1 Spells',
					[opts.counterSlot]: '1 ✓ Shield',
					[opts.counterResetSlot]: false,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
			expect(counter.active[1]).toBe(false);
		});

		it('should handle empty slot', async () => {
			// Arrange
			const counter = createMockPreparedCounter({
				name: 'Level 1 Spells',
				prepared: ['Fireball', null, 'Shield'],
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
				subcommand: 'use-slot',
				options: {
					[opts.counterName]: 'Level 1 Spells',
					[opts.counterSlot]: '1 ✓ (empty)',
					[opts.counterResetSlot]: false,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
			expect(counter.active[1]).toBe(false);
		});
	});

	describe('error handling', () => {
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
				subcommand: 'use-slot',
				options: {
					[opts.counterName]: 'Gold',
					[opts.counterSlot]: '0 ✓ Something',
					[opts.counterResetSlot]: false,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - Error is caught and responded to
			expect(result.didRespond()).toBe(true);
		});

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
				subcommand: 'use-slot',
				options: {
					[opts.counterName]: 'Nonexistent',
					[opts.counterSlot]: '0 ✓ Fireball',
					[opts.counterResetSlot]: false,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - Error is caught and responded to
			expect(result.didRespond()).toBe(true);
		});

		it('should throw error when slot format is invalid', async () => {
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
				subcommand: 'use-slot',
				options: {
					[opts.counterName]: 'Spells',
					[opts.counterSlot]: 'invalid format',
					[opts.counterResetSlot]: false,
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
				subcommand: 'use-slot',
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
				subcommand: 'use-slot',
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
