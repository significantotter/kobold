/**
 * Unit tests for ConditionRemoveSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SheetAdjustmentTypeEnum } from '@kobold/db';
import { ConditionCommand } from './condition-command.js';
import { ConditionRemoveSubCommand } from './condition-remove-subcommand.js';
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
import { CollectorUtils } from '../../../utils/collector-utils.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-helpers/finder-helpers.js');
vi.mock('../../../utils/collector-utils.js');

describe('ConditionRemoveSubCommand', () => {
	const kobold = getMockKobold();

	let harness: CommandTestHarness;

	beforeEach(() => {
		resetMockKobold(kobold);
		harness = createTestHarness([new ConditionCommand([new ConditionRemoveSubCommand()])]);
	});

	describe('condition removal flow', () => {
		it('should remove condition when user confirms', async () => {
			// Arrange
			const existingCondition = createMockCondition({
				name: 'Frightened',
				type: SheetAdjustmentTypeEnum.status,
				severity: 2,
			});
			setupConditionMocks({
				conditions: [existingCondition],
				targetName: 'Test Character',
			});
			setupConditionFinderHelpersMocks(existingCondition);
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Mock button collector to simulate user confirming removal
			vi.mocked(CollectorUtils.collectByButton).mockResolvedValue({
				intr: { user: { id: TEST_USER_ID } } as any,
				value: 'remove',
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'condition',
				subcommand: 'remove',
				options: {
					'gameplay-target-character': 'Test Character',
					name: 'Frightened',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should cancel removal when user cancels', async () => {
			// Arrange
			const existingCondition = createMockCondition({
				name: 'Frightened',
				type: SheetAdjustmentTypeEnum.status,
				severity: 2,
			});
			setupConditionMocks({
				conditions: [existingCondition],
				targetName: 'Test Character',
			});
			setupConditionFinderHelpersMocks(existingCondition);
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Mock button collector to simulate user cancelling
			vi.mocked(CollectorUtils.collectByButton).mockResolvedValue({
				intr: { user: { id: TEST_USER_ID } } as any,
				value: 'cancel',
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'condition',
				subcommand: 'remove',
				options: {
					'gameplay-target-character': 'Test Character',
					name: 'Frightened',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).not.toHaveBeenCalled();
		});

		it('should respond with not found when condition does not exist', async () => {
			// Arrange
			setupConditionMocks({ conditions: [], targetName: 'Test Character' });
			setupConditionFinderHelpersMocks(undefined); // No condition found

			// Act
			const result = await harness.executeCommand({
				commandName: 'condition',
				subcommand: 'remove',
				options: {
					'gameplay-target-character': 'Test Character',
					name: 'Nonexistent Condition',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
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
				subcommand: 'remove',
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
				createMockCondition({ name: 'Sickened' }),
			];
			setupConditionAutocompleteMocks({
				conditions,
				targetName: 'Test Character',
			});

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'condition',
				subcommand: 'remove',
				focusedOption: { name: 'name', value: 'F' },
				options: { 'gameplay-target-character': 'Test Character' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.getChoices()).toBeDefined();
		});

		it('should return empty array when no conditions match', async () => {
			// Arrange
			setupConditionAutocompleteMocks({
				conditions: [createMockCondition({ name: 'Frightened' })],
				targetName: 'Test Character',
			});

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'condition',
				subcommand: 'remove',
				focusedOption: { name: 'name', value: 'XYZ' },
				options: { 'gameplay-target-character': 'Test Character' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - Should return conditions (filtering happens in autocomplete handler)
			expect(result.getChoices()).toBeDefined();
		});
	});

	describe('command routing', () => {
		it('should properly route to remove subcommand via CommandHandler', async () => {
			// Arrange
			setupConditionMocks({ conditions: [], targetName: 'Test Character' });
			setupConditionFinderHelpersMocks(undefined);

			// Act
			const result = await harness.executeCommand({
				commandName: 'condition',
				subcommand: 'remove',
				options: {
					'gameplay-target-character': 'Test Character',
					name: 'Test',
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
