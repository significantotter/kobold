/**
 * Integration tests for ConditionApplyCustomSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vitestKobold } from '@kobold/db/test-utils';
import { SheetAdjustmentTypeEnum } from '@kobold/db';
import { ConditionCommand } from './condition-command.js';
import { ConditionApplyCustomSubCommand } from './condition-apply-custom-subcommand.js';
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
import { SheetUtils } from '../../../utils/sheet/sheet-utils.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-helpers/finder-helpers.js');

describe('ConditionApplyCustomSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new ConditionCommand([new ConditionApplyCustomSubCommand()])]);
		// Mock validation functions to pass - these involve complex dice parsing
		vi.spyOn(InputParseUtils, 'isValidRollTargetTags').mockReturnValue(true);
		vi.spyOn(InputParseUtils, 'isValidDiceExpression').mockReturnValue(true);
		// Mock sheet adjustment validation - uses complex sheet calculations
		vi.spyOn(SheetUtils, 'adjustSheetWithModifiers').mockReturnValue({} as any);
	});


	describe('successful condition creation', () => {
		it('should create a condition with roll adjustment', async () => {
			// Arrange
			setupConditionMocks({ conditions: [], targetName: 'Test Character' });
			setupConditionFinderHelpersMocks(undefined); // No existing condition
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'condition',
				subcommand: 'apply-custom',
				options: {
					'gameplay-target-character': 'Test Character',
					name: 'Frightened',
					type: SheetAdjustmentTypeEnum.status,
					severity: '2',
					'roll-adjustment': '-2',
					'roll-target-tags': 'attack,skill',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should create a condition with sheet adjustment', async () => {
			// Arrange
			setupConditionMocks({ conditions: [], targetName: 'Test Character' });
			setupConditionFinderHelpersMocks(undefined);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'condition',
				subcommand: 'apply-custom',
				options: {
					'gameplay-target-character': 'Test Character',
					name: 'Haste',
					type: SheetAdjustmentTypeEnum.status,
					'sheet-values': 'speed +10',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should create condition with description and note', async () => {
			// Arrange
			setupConditionMocks({ conditions: [], targetName: 'Test Character' });
			setupConditionFinderHelpersMocks(undefined);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'condition',
				subcommand: 'apply-custom',
				options: {
					'gameplay-target-character': 'Test Character',
					name: 'Blessed',
					type: SheetAdjustmentTypeEnum.status,
					description: 'Divine blessing from the cleric',
					'initiative-note': 'Ends on turn 5',
					'roll-adjustment': '+1',
					'roll-target-tags': 'attack',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should create condition with default type when not specified', async () => {
			// Arrange
			setupConditionMocks({ conditions: [], targetName: 'Test Character' });
			setupConditionFinderHelpersMocks(undefined);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'condition',
				subcommand: 'apply-custom',
				options: {
					'gameplay-target-character': 'Test Character',
					name: 'Custom Buff',
					'sheet-values': 'ac +2',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});
	});

	describe('validation errors', () => {
		it('should error when condition name already exists', async () => {
			// Arrange
			const existingCondition = createMockCondition({ name: 'Frightened' });
			setupConditionMocks({
				conditions: [existingCondition],
				targetName: 'Test Character',
			});
			setupConditionFinderHelpersMocks(existingCondition);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'condition',
				subcommand: 'apply-custom',
				options: {
					'gameplay-target-character': 'Test Character',
					name: 'Frightened',
					'roll-adjustment': '-2',
					'roll-target-tags': 'attack',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).not.toHaveBeenCalled();
		});

		it('should error when roll adjustment provided without target tags', async () => {
			// Arrange
			setupConditionMocks({ conditions: [], targetName: 'Test Character' });
			setupConditionFinderHelpersMocks(undefined);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'condition',
				subcommand: 'apply-custom',
				options: {
					'gameplay-target-character': 'Test Character',
					name: 'Invalid',
					'roll-adjustment': '-2',
					// Missing roll-target-tags
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).not.toHaveBeenCalled();
		});

		it('should error when target tags provided without roll adjustment', async () => {
			// Arrange
			setupConditionMocks({ conditions: [], targetName: 'Test Character' });
			setupConditionFinderHelpersMocks(undefined);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'condition',
				subcommand: 'apply-custom',
				options: {
					'gameplay-target-character': 'Test Character',
					name: 'Invalid',
					'roll-target-tags': 'attack',
					// Missing roll-adjustment
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).not.toHaveBeenCalled();
		});

		it('should error when neither roll adjustment nor sheet values provided', async () => {
			// Arrange
			setupConditionMocks({ conditions: [], targetName: 'Test Character' });
			setupConditionFinderHelpersMocks(undefined);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'condition',
				subcommand: 'apply-custom',
				options: {
					'gameplay-target-character': 'Test Character',
					name: 'Empty Condition',
					// No roll-adjustment or sheet-values
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
		it('should return target character options for autocomplete', async () => {
			// Arrange
			setupConditionAutocompleteMocks({
				conditions: [],
				targetName: 'Test Character',
			});

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'condition',
				subcommand: 'apply-custom',
				focusedOption: { name: 'gameplay-target-character', value: 'Test' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.getChoices()).toBeDefined();
		});
	});
});
