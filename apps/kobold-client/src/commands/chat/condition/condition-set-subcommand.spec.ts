/**
 * Integration tests for ConditionSetSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vitestKobold } from '@kobold/db/test-utils';
import { SheetAdjustmentTypeEnum } from '@kobold/db';
import { ConditionCommand } from './condition-command.js';
import { ConditionSetSubCommand } from './condition-set-subcommand.js';
import {
	createTestHarness,
	createMockCondition,
	setupConditionMocks,
	setupConditionFinderHelpersMocks,
	setupConditionAutocompleteMocks,
	setupSheetRecordUpdateMock,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';
import { InputParseUtils } from '../../../utils/input-parse-utils.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-helpers/finder-helpers.js');
// Mock Creature to avoid complex sheetRecord validation during tests
vi.mock('../../../utils/creature.js', () => ({
	Creature: vi.fn().mockImplementation(() => ({})),
}));
vi.mock('../../../utils/input-parse-utils.js', () => ({
	InputParseUtils: {
		isValidRollTargetTags: vi.fn(() => true),
		isValidDiceExpression: vi.fn(() => true),
		parseAsSheetAdjustments: vi.fn(() => []),
		parseAsNullableNumber: vi.fn(val => {
			if (val === null || val === undefined) return null;
			const num = parseInt(val, 10);
			return isNaN(num) ? null : num;
		}),
		parseAsNumber: vi.fn(val => parseInt(val, 10)),
		parseAsString: vi.fn(val => val ?? ''),
		parseAsNullableString: vi.fn(val => val ?? null),
		parseAsBoolean: vi.fn(val => val === 'true'),
		isNullString: vi.fn(val => val === 'None' || val === 'null'),
		isValidString: vi.fn(() => true),
		isValidNumber: vi.fn(() => true),
	},
}));

describe('ConditionSetSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new ConditionCommand([new ConditionSetSubCommand()])]);

		// Re-apply InputParseUtils mocks in beforeEach to ensure they're properly set
		// after vi.restoreAllMocks() in the global afterEach clears them
		vi.mocked(InputParseUtils.isValidDiceExpression).mockReturnValue(true);
		vi.mocked(InputParseUtils.isValidRollTargetTags).mockReturnValue(true);
		vi.mocked(InputParseUtils.parseAsSheetAdjustments).mockReturnValue([]);
		vi.mocked(InputParseUtils.parseAsNullableNumber).mockImplementation(val => {
			if (val === null || val === undefined) return null;
			const num = parseInt(val, 10);
			return isNaN(num) ? null : num;
		});
		vi.mocked(InputParseUtils.parseAsNumber).mockImplementation(val => parseInt(val, 10));
		vi.mocked(InputParseUtils.parseAsString).mockImplementation(val => val ?? '');
		vi.mocked(InputParseUtils.parseAsNullableString).mockImplementation(val => val ?? null);
		vi.mocked(InputParseUtils.parseAsBoolean).mockImplementation(val => val === 'true');
		vi.mocked(InputParseUtils.isNullString).mockImplementation(
			val => val === 'None' || val === 'null'
		);
		vi.mocked(InputParseUtils.isValidString).mockReturnValue(true);
		vi.mocked(InputParseUtils.isValidNumber).mockReturnValue(true);
	});


	describe('setting string fields', () => {
		it('should set condition name', async () => {
			// Arrange
			const existingCondition = createMockCondition({
				name: 'Old Name',
				type: SheetAdjustmentTypeEnum.status,
			});
			setupConditionMocks({
				conditions: [existingCondition],
				targetName: 'Test Character',
			});
			setupConditionFinderHelpersMocks(existingCondition);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'condition',
				subcommand: 'set',
				options: {
					'gameplay-target-character': 'Test Character',
					name: 'Old Name',
					option: 'name',
					value: 'New Name',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should set condition description', async () => {
			// Arrange
			const existingCondition = createMockCondition({
				name: 'Frightened',
				description: 'Old description',
			});
			setupConditionMocks({
				conditions: [existingCondition],
				targetName: 'Test Character',
			});
			setupConditionFinderHelpersMocks(existingCondition);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'condition',
				subcommand: 'set',
				options: {
					'gameplay-target-character': 'Test Character',
					name: 'Frightened',
					option: 'description',
					value: 'A new description for the condition',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should set initiative-note', async () => {
			// Arrange
			const existingCondition = createMockCondition({
				name: 'Sickened',
				note: null,
			});
			setupConditionMocks({
				conditions: [existingCondition],
				targetName: 'Test Character',
			});
			setupConditionFinderHelpersMocks(existingCondition);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'condition',
				subcommand: 'set',
				options: {
					'gameplay-target-character': 'Test Character',
					name: 'Sickened',
					option: 'initiative-note',
					value: 'Ends on turn 5',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});
	});

	describe('setting enum fields', () => {
		it('should set condition type', async () => {
			// Arrange
			const existingCondition = createMockCondition({
				name: 'Buff',
				type: SheetAdjustmentTypeEnum.untyped,
			});
			setupConditionMocks({
				conditions: [existingCondition],
				targetName: 'Test Character',
			});
			setupConditionFinderHelpersMocks(existingCondition);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'condition',
				subcommand: 'set',
				options: {
					'gameplay-target-character': 'Test Character',
					name: 'Buff',
					option: 'type',
					value: 'status',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});
	});

	describe('setting numeric fields', () => {
		it('should set severity', async () => {
			// Arrange
			const existingCondition = createMockCondition({
				name: 'Frightened',
				severity: 1,
			});
			setupConditionMocks({
				conditions: [existingCondition],
				targetName: 'Test Character',
			});
			setupConditionFinderHelpersMocks(existingCondition);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'condition',
				subcommand: 'set',
				options: {
					'gameplay-target-character': 'Test Character',
					name: 'Frightened',
					option: 'severity',
					value: '3',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});
	});

	describe('setting roll fields', () => {
		it('should set roll adjustment', async () => {
			// Arrange
			const existingCondition = createMockCondition({
				name: 'Bless',
				rollAdjustment: '+1',
				rollTargetTags: 'attack',
			});
			setupConditionMocks({
				conditions: [existingCondition],
				targetName: 'Test Character',
			});
			setupConditionFinderHelpersMocks(existingCondition);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'condition',
				subcommand: 'set',
				options: {
					'gameplay-target-character': 'Test Character',
					name: 'Bless',
					option: 'roll-adjustment',
					value: '+2',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should set roll target tags', async () => {
			// Arrange
			const existingCondition = createMockCondition({
				name: 'Bless',
				rollAdjustment: '+1',
				rollTargetTags: 'attack',
			});
			setupConditionMocks({
				conditions: [existingCondition],
				targetName: 'Test Character',
			});
			setupConditionFinderHelpersMocks(existingCondition);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'condition',
				subcommand: 'set',
				options: {
					'gameplay-target-character': 'Test Character',
					name: 'Bless',
					option: 'roll-target-tags',
					value: 'attack,damage',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});
	});

	describe('error handling', () => {
		it('should error when condition not found', async () => {
			// Arrange
			setupConditionMocks({ conditions: [], targetName: 'Test Character' });
			setupConditionFinderHelpersMocks(undefined); // Condition not found
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'condition',
				subcommand: 'set',
				options: {
					'gameplay-target-character': 'Test Character',
					name: 'Nonexistent',
					option: 'name',
					value: 'New Name',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).not.toHaveBeenCalled();
		});
	});

	describe('autocomplete', () => {
		it('should return target character options for gameplay-target-character autocomplete', async () => {
			// Arrange
			setupConditionAutocompleteMocks({
				conditions: [createMockCondition({ name: 'Frightened' })],
				targetName: 'Test Character',
			});

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'condition',
				subcommand: 'set',
				focusedOption: { name: 'gameplay-target-character', value: 'Test' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.getChoices()).toBeDefined();
		});

		it('should return matching conditions for name autocomplete', async () => {
			// Arrange
			const conditions = [
				createMockCondition({ name: 'Frightened' }),
				createMockCondition({ name: 'Flat-Footed' }),
			];
			setupConditionAutocompleteMocks({
				conditions,
				targetName: 'Test Character',
			});

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'condition',
				subcommand: 'set',
				focusedOption: { name: 'name', value: 'Fr' },
				options: { 'gameplay-target-character': 'Test Character' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.getChoices()).toBeDefined();
		});
	});
});
