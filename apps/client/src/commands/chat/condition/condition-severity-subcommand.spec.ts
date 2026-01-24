/**
 * Unit tests for ConditionSeveritySubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SheetAdjustmentTypeEnum } from '@kobold/db';
import { ConditionCommand } from './condition-command.js';
import { ConditionSeveritySubCommand } from './condition-severity-subcommand.js';
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
	getMockKobold,
	resetMockKobold,} from '../../../test-utils/index.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-helpers/finder-helpers.js');

describe('ConditionSeveritySubCommand', () => {
	const kobold = getMockKobold();

	let harness: CommandTestHarness;

	beforeEach(() => {
		resetMockKobold(kobold);
		harness = createTestHarness([new ConditionCommand([new ConditionSeveritySubCommand()])]);
	});

	describe('successful severity updates', () => {
		it('should increase condition severity', async () => {
			// Arrange
			const existingCondition = createMockCondition({
				name: 'Frightened',
				type: SheetAdjustmentTypeEnum.status,
				severity: 1,
			});
			setupConditionMocks({
				conditions: [existingCondition],
				targetName: 'Test Character',
			});
			setupConditionFinderHelpersMocks(existingCondition);
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'condition',
				subcommand: 'severity',
				options: {
					'gameplay-target-character': 'Test Character',
					name: 'Frightened',
					severity: '3',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should decrease condition severity', async () => {
			// Arrange
			const existingCondition = createMockCondition({
				name: 'Sickened',
				type: SheetAdjustmentTypeEnum.status,
				severity: 3,
			});
			setupConditionMocks({
				conditions: [existingCondition],
				targetName: 'Test Character',
			});
			setupConditionFinderHelpersMocks(existingCondition);
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'condition',
				subcommand: 'severity',
				options: {
					'gameplay-target-character': 'Test Character',
					name: 'Sickened',
					severity: '1',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should set severity to zero', async () => {
			// Arrange
			const existingCondition = createMockCondition({
				name: 'Wounded',
				type: SheetAdjustmentTypeEnum.status,
				severity: 2,
			});
			setupConditionMocks({
				conditions: [existingCondition],
				targetName: 'Test Character',
			});
			setupConditionFinderHelpersMocks(existingCondition);
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'condition',
				subcommand: 'severity',
				options: {
					'gameplay-target-character': 'Test Character',
					name: 'Wounded',
					severity: '0',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should remove severity (set to null)', async () => {
			// Arrange
			const existingCondition = createMockCondition({
				name: 'Custom Condition',
				type: SheetAdjustmentTypeEnum.untyped,
				severity: 5,
			});
			setupConditionMocks({
				conditions: [existingCondition],
				targetName: 'Test Character',
			});
			setupConditionFinderHelpersMocks(existingCondition);
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act - empty string or null to remove severity
			const result = await harness.executeCommand({
				commandName: 'condition',
				subcommand: 'severity',
				options: {
					'gameplay-target-character': 'Test Character',
					name: 'Custom Condition',
					severity: '',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should handle condition without prior severity', async () => {
			// Arrange
			const existingCondition = createMockCondition({
				name: 'New Condition',
				type: SheetAdjustmentTypeEnum.status,
				severity: null,
			});
			setupConditionMocks({
				conditions: [existingCondition],
				targetName: 'Test Character',
			});
			setupConditionFinderHelpersMocks(existingCondition);
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'condition',
				subcommand: 'severity',
				options: {
					'gameplay-target-character': 'Test Character',
					name: 'New Condition',
					severity: '2',
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
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'condition',
				subcommand: 'severity',
				options: {
					'gameplay-target-character': 'Test Character',
					name: 'Nonexistent',
					severity: '1',
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
				conditions: [createMockCondition({ name: 'Frightened', severity: 2 })],
				targetName: 'Test Character',
			});

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'condition',
				subcommand: 'severity',
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
				createMockCondition({ name: 'Frightened', severity: 2 }),
				createMockCondition({ name: 'Flat-Footed', severity: null }),
				createMockCondition({ name: 'Sickened', severity: 1 }),
			];
			setupConditionAutocompleteMocks({
				conditions,
				targetName: 'Test Character',
			});

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'condition',
				subcommand: 'severity',
				focusedOption: { name: 'name', value: 'F' },
				options: { 'gameplay-target-character': 'Test Character' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.getChoices()).toBeDefined();
		});
	});

	describe('command routing', () => {
		it('should properly route to severity subcommand via CommandHandler', async () => {
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
			setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'condition',
				subcommand: 'severity',
				options: {
					'gameplay-target-character': 'Test Character',
					name: 'Frightened',
					severity: '2',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(harness.getCommands()).toHaveLength(1);
			expect(harness.getCommands()[0].name).toBe('condition');
		});
	});
});
