/**
 * Unit tests for ConditionApplyModifierSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SheetAdjustmentTypeEnum } from '@kobold/db';
import { ConditionCommand } from './condition-command.js';
import { ConditionApplyModifierSubCommand } from './condition-apply-modifier-subcommand.js';
import {
	createMockCharacter,
	createMockCondition,
	setupConditionAutocompleteMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
	getMockKobold,
	resetMockKobold,
	createTestHarness,
	type MockKoboldUtils,
} from '../../../test-utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-helpers/finder-helpers.js');

describe('ConditionApplyModifierSubCommand', () => {
	const kobold = getMockKobold();
	let harness: CommandTestHarness;

	beforeEach(() => {
		resetMockKobold(kobold);
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

			const targetSheetRecord = {
				id: 'target-id',
				conditions: [] as any[],
				modifiers: [],
				sheet: { staticInfo: { name: 'Fighter' }, info: {} },
			} as any;

			// Setup KoboldUtils mock with both gameUtils and characterUtils
			vi.mocked(KoboldUtils).mockImplementation(function (this: MockKoboldUtils) {
				(this as MockKoboldUtils & { gameUtils: unknown }).gameUtils = {
					getCharacterOrInitActorTarget: vi.fn(async () => ({
						targetSheetRecord,
						targetName: 'Fighter',
						hideStats: false,
					})),
				};
				(this as MockKoboldUtils & { characterUtils: unknown }).characterUtils = {
					findOwnedCharacterByName: vi.fn(async () => [sourceCharacter]),
				};
				return this;
			} as unknown as () => KoboldUtils);

			vi.spyOn(FinderHelpers, 'getModifierByName').mockReturnValue(sourceModifier);
			vi.spyOn(FinderHelpers, 'getConditionByName').mockReturnValue(undefined);

			// Setup the sheetRecord.update mock directly on mockKobold
			kobold.sheetRecord.update.mockResolvedValue(targetSheetRecord);

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
			expect(kobold.sheetRecord.update).toHaveBeenCalled();
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

			const targetSheetRecord = {
				id: 'target-id',
				conditions: [] as any[],
				modifiers: [],
				sheet: { staticInfo: { name: 'Fighter' }, info: {} },
			} as any;

			vi.mocked(KoboldUtils).mockImplementation(function (this: MockKoboldUtils) {
				(this as MockKoboldUtils & { gameUtils: unknown }).gameUtils = {
					getCharacterOrInitActorTarget: vi.fn(async () => ({
						targetSheetRecord,
						targetName: 'Fighter',
						hideStats: false,
					})),
				};
				(this as MockKoboldUtils & { characterUtils: unknown }).characterUtils = {
					findOwnedCharacterByName: vi.fn(async () => [sourceCharacter]),
				};
				return this;
			} as unknown as () => KoboldUtils);

			vi.spyOn(FinderHelpers, 'getModifierByName').mockReturnValue(sourceModifier);
			vi.spyOn(FinderHelpers, 'getConditionByName').mockReturnValue(undefined);

			kobold.sheetRecord.update.mockResolvedValue(targetSheetRecord);

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
			expect(kobold.sheetRecord.update).toHaveBeenCalled();
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

			const targetSheetRecord = {
				id: 'target-id',
				conditions: [existingCondition],
				modifiers: [],
				sheet: { staticInfo: { name: 'Fighter' }, info: {} },
			} as any;

			vi.mocked(KoboldUtils).mockImplementation(function (this: MockKoboldUtils) {
				(this as MockKoboldUtils & { gameUtils: unknown }).gameUtils = {
					getCharacterOrInitActorTarget: vi.fn(async () => ({
						targetSheetRecord,
						targetName: 'Fighter',
						hideStats: false,
					})),
				};
				(this as MockKoboldUtils & { characterUtils: unknown }).characterUtils = {
					findOwnedCharacterByName: vi.fn(async () => [sourceCharacter]),
				};
				return this;
			} as unknown as () => KoboldUtils);

			vi.spyOn(FinderHelpers, 'getModifierByName').mockReturnValue(sourceModifier);
			vi.spyOn(FinderHelpers, 'getConditionByName').mockReturnValue(existingCondition);

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
			expect(kobold.sheetRecord.update).not.toHaveBeenCalled();
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
