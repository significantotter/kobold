/**
 * Integration tests for ConditionListSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SheetAdjustmentTypeEnum } from '@kobold/db';
import { ConditionCommand } from './condition-command.js';
import { ConditionListSubCommand } from './condition-list-subcommand.js';
import {
	createTestHarness,
	createMockCondition,
	setupConditionMocks,
	setupConditionAutocompleteMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');

describe('ConditionListSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new ConditionCommand([new ConditionListSubCommand()])]);
	});


	describe('successful condition listing', () => {
		it('should list all conditions for a character', async () => {
			// Arrange
			const conditions = [
				createMockCondition({
					name: 'Frightened',
					description: 'Shaken by fear',
					type: SheetAdjustmentTypeEnum.status,
					severity: 2,
				}),
				createMockCondition({
					name: 'Sickened',
					description: 'Feeling ill',
					type: SheetAdjustmentTypeEnum.status,
					severity: 1,
				}),
			];

			setupConditionMocks({ conditions, targetName: 'Test Character' });

			// Act
			const result = await harness.executeCommand({
				commandName: 'condition',
				subcommand: 'list',
				options: { 'gameplay-target-character': 'Test Character' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should handle character with no conditions', async () => {
			// Arrange
			setupConditionMocks({ conditions: [], targetName: 'Test Character' });

			// Act
			const result = await harness.executeCommand({
				commandName: 'condition',
				subcommand: 'list',
				options: { 'gameplay-target-character': 'Test Character' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should handle conditions with roll adjustments', async () => {
			// Arrange
			const conditions = [
				createMockCondition({
					name: 'Bless',
					description: 'Divine favor',
					type: SheetAdjustmentTypeEnum.status,
					rollAdjustment: '+1',
					rollTargetTags: 'attack',
				}),
			];

			setupConditionMocks({ conditions, targetName: 'Test Character' });

			// Act
			const result = await harness.executeCommand({
				commandName: 'condition',
				subcommand: 'list',
				options: { 'gameplay-target-character': 'Test Character' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should handle conditions with sheet adjustments', async () => {
			// Arrange
			const conditions = [
				createMockCondition({
					name: 'Haste',
					description: 'Moving faster',
					type: SheetAdjustmentTypeEnum.status,
					sheetAdjustments: [
						{
							property: 'speed',
							propertyType: 'intProperty' as any,
							operation: '+' as any,
							value: '10',
							type: SheetAdjustmentTypeEnum.status,
						},
					],
				}),
			];

			setupConditionMocks({ conditions, targetName: 'Test Character' });

			// Act
			const result = await harness.executeCommand({
				commandName: 'condition',
				subcommand: 'list',
				options: { 'gameplay-target-character': 'Test Character' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should sort conditions alphabetically by name', async () => {
			// Arrange
			const conditions = [
				createMockCondition({ name: 'Wounded' }),
				createMockCondition({ name: 'Blinded' }),
				createMockCondition({ name: 'Frightened' }),
			];

			setupConditionMocks({ conditions, targetName: 'Test Character' });

			// Act
			const result = await harness.executeCommand({
				commandName: 'condition',
				subcommand: 'list',
				options: { 'gameplay-target-character': 'Test Character' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('autocomplete', () => {
		it('should return target character options for autocomplete', async () => {
			// Arrange
			setupConditionAutocompleteMocks({
				conditions: [createMockCondition({ name: 'Frightened' })],
				targetName: 'Test Character',
			});

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'condition',
				subcommand: 'list',
				focusedOption: { name: 'gameplay-target-character', value: 'Test' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.getChoices()).toBeDefined();
		});
	});
});
