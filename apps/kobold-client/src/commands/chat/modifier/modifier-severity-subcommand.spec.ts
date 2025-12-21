/**
 * Integration tests for ModifierSeveritySubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vitestKobold } from '@kobold/db/test-utils';
import { SheetAdjustmentTypeEnum } from '@kobold/db';
import { ModifierCommand } from './modifier-command.js';
import { ModifierSeveritySubCommand } from './modifier-severity-subcommand.js';
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

describe('ModifierSeveritySubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new ModifierCommand([new ModifierSeveritySubCommand()])]);
	});


	describe('successful severity updates', () => {
		it('should set severity on a modifier', async () => {
			// Arrange
			const testModifier = {
				name: 'frightened',
				isActive: true,
				description: 'Fear condition',
				type: SheetAdjustmentTypeEnum.status,
				severity: null,
				sheetAdjustments: [],
				rollAdjustment: '-1',
				rollTargetTags: 'attack OR skill',
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
				subcommand: 'severity',
				options: {
					name: 'frightened',
					severity: '2',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should update existing severity value', async () => {
			// Arrange
			const testModifier = {
				name: 'frightened',
				isActive: true,
				description: 'Fear condition',
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
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'severity',
				options: {
					name: 'frightened',
					severity: '3',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should clear severity when set to null', async () => {
			// Arrange
			const testModifier = {
				name: 'frightened',
				isActive: true,
				description: 'Fear condition',
				type: SheetAdjustmentTypeEnum.status,
				severity: 2,
				sheetAdjustments: [],
				rollAdjustment: '-2',
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
				subcommand: 'severity',
				options: {
					name: 'frightened',
					severity: 'none',
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
			const testModifier = {
				name: 'frightened',
				isActive: true,
				description: null,
				type: SheetAdjustmentTypeEnum.status,
				severity: 3,
				sheetAdjustments: [],
				rollAdjustment: '-3',
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
				subcommand: 'severity',
				options: {
					name: 'frightened',
					severity: '0',
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
				subcommand: 'severity',
				options: {
					name: 'nonexistent',
					severity: '2',
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
				name: 'frightened',
				isActive: true,
				description: null,
				type: SheetAdjustmentTypeEnum.status,
				severity: 2,
				sheetAdjustments: [],
				rollAdjustment: '-2',
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
				subcommand: 'severity',
				focusedOption: { name: 'name', value: 'fri' },
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
				subcommand: 'severity',
				focusedOption: { name: 'name', value: 'test' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.getChoices()).toEqual([]);
		});
	});
});
