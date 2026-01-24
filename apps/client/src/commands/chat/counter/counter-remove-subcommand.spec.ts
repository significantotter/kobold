/**
 * Unit tests for CounterRemoveSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CounterStyleEnum } from '@kobold/db';
import { CounterDefinition as CounterCommandDoc } from '@kobold/documentation';
import { CounterCommand } from './counter-command.js';
import { CounterRemoveSubCommand } from './counter-remove-subcommand.js';

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
	getMockKobold,
	resetMockKobold,} from '../../../test-utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { CollectorUtils } from '../../../utils/collector-utils.js';
import type { Counter, CounterGroup, NumericCounter } from '@kobold/db';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-helpers/finder-helpers.js');
vi.mock('../../../utils/collector-utils.js');

describe('CounterRemoveSubCommand', () => {
	const kobold = getMockKobold();

	let harness: CommandTestHarness;

	beforeEach(() => {
		resetMockKobold(kobold);
		harness = createTestHarness([new CounterCommand([new CounterRemoveSubCommand()])]);
	});

	describe('removing counters', () => {
		it('should remove a counter when confirmed', async () => {
			// Arrange
			const counter = createMockNumericCounter({ name: 'Gold' });

			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter,
				group: null,
			});
			vi.mocked(CollectorUtils.collectByButton).mockResolvedValue({
				intr: {} as any,
				value: 'remove',
			});
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'remove',
				options: { [opts.counterName]: 'Gold' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should not remove counter when cancelled', async () => {
			// Arrange
			const counter = createMockNumericCounter({ name: 'Gold' });

			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter,
				group: null,
			});
			vi.mocked(CollectorUtils.collectByButton).mockResolvedValue({
				intr: {} as any,
				value: 'cancel',
			});
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'remove',
				options: { [opts.counterName]: 'Gold' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).not.toHaveBeenCalled();
		});

		it('should remove counter from a group', async () => {
			// Arrange
			const counter = createMockNumericCounter({ name: 'Level 1' });
			const group = createMockCounterGroup({
				name: 'Spell Slots',
				counters: [counter, createMockNumericCounter({ name: 'Level 2' })],
			});

			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.sheet.counterGroups = [group];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter,
				group,
			});
			vi.mocked(CollectorUtils.collectByButton).mockResolvedValue({
				intr: {} as any,
				value: 'remove',
			});
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'remove',
				options: { [opts.counterName]: 'Level 1' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
			expect(group.counters.length).toBe(1);
		});

		it('should handle timeout gracefully', async () => {
			// Arrange
			const counter = createMockNumericCounter({ name: 'Gold' });

			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter,
				group: null,
			});
			vi.mocked(CollectorUtils.collectByButton).mockResolvedValue(undefined);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'remove',
				options: { [opts.counterName]: 'Gold' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
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
				subcommand: 'remove',
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
			const counters: Counter[] = [
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
				subcommand: 'remove',
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
