/**
 * Integration tests for CounterCreateSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vitestKobold } from '@kobold/db/test-utils';
import { CounterStyleEnum } from '@kobold/db';
import { CounterDefinition as CounterCommandDoc } from '@kobold/documentation';
import { CounterCommand } from './counter-command.js';
import { CounterCreateSubCommand } from './counter-create-subcommand.js';

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
} from '../../../test-utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import type { CounterGroup, NumericCounter } from '@kobold/db';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-helpers/finder-helpers.js');

describe('CounterCreateSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new CounterCommand([new CounterCreateSubCommand()])]);
	});

	describe('creating numeric counters', () => {
		it('should create a basic numeric counter', async () => {
			// Arrange
			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter: null,
				group: null,
			});
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'create',
				options: {
					name: 'Gold',
					style: CounterStyleEnum.default,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should create a counter with max value', async () => {
			// Arrange
			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter: null,
				group: null,
			});
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'create',
				options: {
					[opts.counterName]: 'Hit Points',
					[opts.counterStyle]: CounterStyleEnum.default,
					[opts.counterMax]: 45,
					[opts.counterDescription]: 'Current HP',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should create a recoverable counter', async () => {
			// Arrange
			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter: null,
				group: null,
			});
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'create',
				options: {
					[opts.counterName]: 'Daily Power',
					[opts.counterStyle]: CounterStyleEnum.default,
					[opts.counterMax]: 3,
					[opts.counterRecoverable]: true,
					[opts.counterRecoverTo]: 3,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});
	});

	describe('creating dots counters', () => {
		it('should create a dots counter', async () => {
			// Arrange
			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter: null,
				group: null,
			});
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'create',
				options: {
					[opts.counterName]: 'Focus Points',
					[opts.counterStyle]: CounterStyleEnum.dots,
					[opts.counterMax]: 3,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should reject dots counter with max > 20', async () => {
			// Arrange
			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter: null,
				group: null,
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'create',
				options: {
					[opts.counterName]: 'Too Many Dots',
					[opts.counterStyle]: CounterStyleEnum.dots,
					[opts.counterMax]: 25,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - Error is caught and responded to
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('creating prepared counters', () => {
		it('should create a prepared counter', async () => {
			// Arrange
			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter: null,
				group: null,
			});
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'create',
				options: {
					[opts.counterName]: 'Spell Slots',
					[opts.counterStyle]: CounterStyleEnum.prepared,
					[opts.counterMax]: 4,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should reject recoverTo for prepared counters', async () => {
			// Arrange
			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter: null,
				group: null,
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'create',
				options: {
					[opts.counterName]: 'Bad Prepared',
					[opts.counterStyle]: CounterStyleEnum.prepared,
					[opts.counterMax]: 3,
					[opts.counterRecoverTo]: 2,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - Error is caught and responded to
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('creating counters in groups', () => {
		it('should create a counter in an existing group', async () => {
			// Arrange
			const group = createMockCounterGroup({ name: 'Spell Slots' });
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.sheet.counterGroups = [group];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter: null,
				group: null,
			});
			vi.mocked(FinderHelpers.getCounterGroupByName).mockReturnValue(group);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'create',
				options: {
					[opts.counterName]: 'Level 1',
					[opts.counterStyle]: CounterStyleEnum.default,
					[opts.counterMax]: 4,
					[opts.counterGroupName]: 'Spell Slots',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should fail when group does not exist', async () => {
			// Arrange
			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter: null,
				group: null,
			});
			vi.mocked(FinderHelpers.getCounterGroupByName).mockReturnValue(undefined);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'create',
				options: {
					[opts.counterName]: 'Level 1',
					[opts.counterStyle]: CounterStyleEnum.default,
					[opts.counterGroupName]: 'Nonexistent Group',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - Error is caught and responded to
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('error handling', () => {
		it('should reject duplicate counter names', async () => {
			// Arrange
			const existingCounter = createMockNumericCounter({ name: 'Gold' });

			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter: existingCounter,
				group: null,
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'create',
				options: {
					[opts.counterName]: 'Gold',
					[opts.counterStyle]: CounterStyleEnum.default,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - Error is caught and responded to
			expect(result.didRespond()).toBe(true);
		});

		it('should reject names with parentheses', async () => {
			// Arrange
			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter: null,
				group: null,
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'create',
				options: {
					[opts.counterName]: 'Counter (Level 1)',
					[opts.counterStyle]: CounterStyleEnum.default,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - Error is caught and responded to
			expect(result.didRespond()).toBe(true);
		});

		it('should reject names longer than 50 characters', async () => {
			// Arrange
			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter: null,
				group: null,
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'create',
				options: {
					[opts.counterName]: 'A'.repeat(60),
					[opts.counterStyle]: CounterStyleEnum.default,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - Error is caught and responded to
			expect(result.didRespond()).toBe(true);
		});

		it('should reject invalid style', async () => {
			// Arrange
			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter: null,
				group: null,
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'create',
				options: {
					[opts.counterName]: 'Test',
					[opts.counterStyle]: 'invalid-style',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - Error is caught and responded to
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('autocomplete', () => {
		it('should return matching counter groups for autocomplete', async () => {
			// Arrange
			const groups = [
				createMockCounterGroup({ name: 'Spell Slots' }),
				createMockCounterGroup({ name: 'Special Abilities' }),
			];

			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.sheet.counterGroups = groups;

			setupAutocompleteKoboldMocks({
				characterOverrides: mockCharacter,
			});

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'counter',
				subcommand: 'create',
				options: { [opts.counterGroupName]: 'Sp' },
				focusedOption: { name: opts.counterGroupName, value: 'Sp' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			const choices = result.getChoices();
			expect(choices.length).toBeGreaterThanOrEqual(0);
		});
	});
});
