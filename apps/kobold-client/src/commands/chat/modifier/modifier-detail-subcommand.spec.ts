/**
 * Integration tests for ModifierDetailSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	SheetAdjustmentTypeEnum,
	AdjustablePropertyEnum,
	SheetAdjustmentOperationEnum,
} from '@kobold/db';
import { ModifierCommand } from './modifier-command.js';
import { ModifierDetailSubCommand } from './modifier-detail-subcommand.js';
import {
	createTestHarness,
	createMockCharacter,
	setupKoboldUtilsMocks,
	setupAutocompleteKoboldMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-helpers/finder-helpers.js');

describe('ModifierDetailSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new ModifierCommand([new ModifierDetailSubCommand()])]);
	});


	describe('successful modifier detail retrieval', () => {
		it('should display details for a modifier with roll adjustment', async () => {
			// Arrange
			const testModifier = {
				name: 'inspire courage',
				isActive: true,
				description: 'A rousing battle song',
				type: SheetAdjustmentTypeEnum.status,
				severity: null,
				sheetAdjustments: [],
				rollAdjustment: '+1',
				rollTargetTags: 'attack OR damage',
				note: 'Song Active',
			};
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.modifiers = [testModifier];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getModifierByName').mockReturnValue(testModifier);

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'detail',
				options: {
					name: 'inspire courage',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should display details for a modifier with sheet adjustments', async () => {
			// Arrange
			const testModifier = {
				name: 'strength boost',
				isActive: true,
				description: 'Enhanced strength',
				type: SheetAdjustmentTypeEnum.status,
				severity: null,
				sheetAdjustments: [
					{
						property: 'strength',
						propertyType: AdjustablePropertyEnum.stat,
						operation: SheetAdjustmentOperationEnum['+'],
						value: '2',
						type: SheetAdjustmentTypeEnum.status,
					},
				],
				rollAdjustment: null,
				rollTargetTags: null,
				note: null,
			};
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.modifiers = [testModifier];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getModifierByName').mockReturnValue(testModifier);

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'detail',
				options: {
					name: 'strength boost',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should display details for a modifier with severity', async () => {
			// Arrange
			const testModifier = {
				name: 'frightened',
				isActive: true,
				description: 'You are terrified',
				type: SheetAdjustmentTypeEnum.status,
				severity: 2,
				sheetAdjustments: [],
				rollAdjustment: '-2',
				rollTargetTags: 'attack OR skill',
				note: 'Frightened 2',
			};
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.modifiers = [testModifier];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getModifierByName').mockReturnValue(testModifier);

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'detail',
				options: {
					name: 'frightened',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should display details for an inactive modifier', async () => {
			// Arrange
			const testModifier = {
				name: 'inactive modifier',
				isActive: false,
				description: 'Currently disabled',
				type: SheetAdjustmentTypeEnum.circumstance,
				severity: null,
				sheetAdjustments: [],
				rollAdjustment: '+2',
				rollTargetTags: 'perception',
				note: null,
			};
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.modifiers = [testModifier];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getModifierByName').mockReturnValue(testModifier);

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'detail',
				options: {
					name: 'inactive modifier',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('error handling', () => {
		it('should error when modifier is not found', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.modifiers = [];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getModifierByName').mockReturnValue(undefined);

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'detail',
				options: {
					name: 'nonexistent',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('autocomplete', () => {
		it('should return matching modifiers for name autocomplete', async () => {
			// Arrange
			const testModifier = {
				name: 'inspire courage',
				isActive: true,
				description: null,
				type: SheetAdjustmentTypeEnum.status,
				severity: null,
				sheetAdjustments: [],
				rollAdjustment: '+1',
				rollTargetTags: 'attack',
				note: null,
			};
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.modifiers = [testModifier];

			setupAutocompleteKoboldMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'matchAllModifiers').mockReturnValue([testModifier]);

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'modifier',
				subcommand: 'detail',
				focusedOption: { name: 'name', value: 'ins' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.getChoices()).toBeDefined();
		});

		it('should return empty array when no character is active', async () => {
			// Arrange
			setupAutocompleteKoboldMocks({ noActiveCharacter: true });

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'modifier',
				subcommand: 'detail',
				focusedOption: { name: 'name', value: 'test' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.getChoices()).toEqual([]);
		});
	});
});
