/**
 * Integration tests for ModifierToggleSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vitestKobold } from '@kobold/db/test-utils';
import { SheetAdjustmentTypeEnum } from '@kobold/db';
import { ModifierCommand } from './modifier-command.js';
import { ModifierToggleSubCommand } from './modifier-toggle-subcommand.js';
import {
	createTestHarness,
	createMockCharacter,
	setupKoboldUtilsMocks,
	setupAutocompleteKoboldMocks,
	setupSheetRecordUpdateMock,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-helpers/finder-helpers.js');

describe('ModifierToggleSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new ModifierCommand([new ModifierToggleSubCommand()])]);
	});


	describe('successful modifier toggling', () => {
		it('should toggle an active modifier to inactive', async () => {
			// Arrange
			const testModifier = {
				name: 'inspire courage',
				isActive: true,
				description: 'Bard inspiration',
				type: SheetAdjustmentTypeEnum.status,
				severity: null,
				sheetAdjustments: [],
				rollAdjustment: '+1',
				rollTargetTags: 'attack OR damage',
				note: null,
			};
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.modifiers = [testModifier];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getModifierByName').mockReturnValue(testModifier);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'toggle',
				options: {
					name: 'inspire courage',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should toggle an inactive modifier to active', async () => {
			// Arrange
			const testModifier = {
				name: 'flanking bonus',
				isActive: false,
				description: 'Flanking position bonus',
				type: SheetAdjustmentTypeEnum.circumstance,
				severity: null,
				sheetAdjustments: [],
				rollAdjustment: '+2',
				rollTargetTags: 'attack',
				note: null,
			};
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.modifiers = [testModifier];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getModifierByName').mockReturnValue(testModifier);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'toggle',
				options: {
					name: 'flanking bonus',
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
		it('should error when modifier is not found', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.modifiers = [];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getModifierByName').mockReturnValue(undefined);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'toggle',
				options: {
					name: 'nonexistent',
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
				subcommand: 'toggle',
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
				subcommand: 'toggle',
				focusedOption: { name: 'name', value: 'test' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.getChoices()).toEqual([]);
		});
	});
});
