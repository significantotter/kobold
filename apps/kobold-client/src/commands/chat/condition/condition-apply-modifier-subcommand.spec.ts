/**
 * Integration tests for ConditionApplyModifierSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vitestKobold } from '@kobold/db/test-utils';
import { SheetAdjustmentTypeEnum } from '@kobold/db';
import { ConditionCommand } from './condition-command.js';
import { ConditionApplyModifierSubCommand } from './condition-apply-modifier-subcommand.js';
import {
	createTestHarness,
	createMockCharacter,
	createMockCondition,
	setupConditionMocks,
	setupConditionFinderHelpersMocks,
	setupConditionAutocompleteMocks,
	setupSheetRecordUpdateMock,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-helpers/finder-helpers.js');

describe('ConditionApplyModifierSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([
			new ConditionCommand([new ConditionApplyModifierSubCommand()]),
		]);
	});


	describe('successful modifier application', () => {
		it('should apply a modifier from source character as condition on target', async () => {
			// Arrange
			const sourceModifier = createMockCondition({
				name: 'Inspire Courage',
				description: 'Bard inspiration',
				type: SheetAdjustmentTypeEnum.status,
				rollAdjustment: '+1',
				rollTargetTags: 'attack,damage',
			});
			const sourceCharacter = createMockCharacter({
				characterOverrides: { name: 'Bard' },
			});
			sourceCharacter.sheetRecord.modifiers = [sourceModifier];

			// Setup target character without the condition
			setupConditionMocks({ conditions: [], targetName: 'Fighter' });
			setupConditionFinderHelpersMocks(undefined); // Condition doesn't exist on target

			// Setup source character retrieval
			vi.mocked(KoboldUtils).mockImplementation(
				() =>
					({
						gameUtils: {
							getCharacterOrInitActorTarget: vi.fn().mockResolvedValue({
								targetSheetRecord: {
									id: 'target-id',
									conditions: [],
									sheet: { staticInfo: { name: 'Fighter' } },
								},
								targetName: 'Fighter',
								hideStats: false,
							}),
						},
						characterUtils: {
							findOwnedCharacterByName: vi.fn().mockResolvedValue([sourceCharacter]),
						},
					}) as any
			);

			vi.spyOn(FinderHelpers, 'getModifierByName').mockReturnValue(sourceModifier);
			vi.spyOn(FinderHelpers, 'getConditionByName').mockReturnValue(undefined);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'condition',
				subcommand: 'apply-modifier',
				options: {
					'gameplay-target-character': 'Fighter',
					name: 'Bard - Inspire Courage',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should apply modifier with custom severity', async () => {
			// Arrange
			const sourceModifier = createMockCondition({
				name: 'Frightened',
				type: SheetAdjustmentTypeEnum.status,
				severity: 1,
			});
			const sourceCharacter = createMockCharacter({
				characterOverrides: { name: 'Cleric' },
			});
			sourceCharacter.sheetRecord.modifiers = [sourceModifier];

			vi.mocked(KoboldUtils).mockImplementation(
				() =>
					({
						gameUtils: {
							getCharacterOrInitActorTarget: vi.fn().mockResolvedValue({
								targetSheetRecord: {
									id: 'target-id',
									conditions: [],
									sheet: { staticInfo: { name: 'Fighter' } },
								},
								targetName: 'Fighter',
								hideStats: false,
							}),
						},
						characterUtils: {
							findOwnedCharacterByName: vi.fn().mockResolvedValue([sourceCharacter]),
						},
					}) as any
			);

			vi.spyOn(FinderHelpers, 'getModifierByName').mockReturnValue(sourceModifier);
			vi.spyOn(FinderHelpers, 'getConditionByName').mockReturnValue(undefined);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'condition',
				subcommand: 'apply-modifier',
				options: {
					'gameplay-target-character': 'Fighter',
					name: 'Cleric - Frightened',
					severity: '3',
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
		it('should error when condition already exists on target', async () => {
			// Arrange
			const sourceModifier = createMockCondition({
				name: 'Frightened',
				type: SheetAdjustmentTypeEnum.status,
			});
			const existingCondition = createMockCondition({
				name: 'Frightened',
				type: SheetAdjustmentTypeEnum.status,
			});
			const sourceCharacter = createMockCharacter({
				characterOverrides: { name: 'Cleric' },
			});
			sourceCharacter.sheetRecord.modifiers = [sourceModifier];

			vi.mocked(KoboldUtils).mockImplementation(
				() =>
					({
						gameUtils: {
							getCharacterOrInitActorTarget: vi.fn().mockResolvedValue({
								targetSheetRecord: {
									id: 'target-id',
									conditions: [existingCondition],
									sheet: { staticInfo: { name: 'Fighter' } },
								},
								targetName: 'Fighter',
								hideStats: false,
							}),
						},
						characterUtils: {
							findOwnedCharacterByName: vi.fn().mockResolvedValue([sourceCharacter]),
						},
					}) as any
			);

			vi.spyOn(FinderHelpers, 'getModifierByName').mockReturnValue(sourceModifier);
			vi.spyOn(FinderHelpers, 'getConditionByName').mockReturnValue(existingCondition);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'condition',
				subcommand: 'apply-modifier',
				options: {
					'gameplay-target-character': 'Fighter',
					name: 'Cleric - Frightened',
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
				conditions: [],
				targetName: 'Test Character',
			});

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'condition',
				subcommand: 'apply-modifier',
				focusedOption: { name: 'gameplay-target-character', value: 'Test' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.getChoices()).toBeDefined();
		});
	});
});
