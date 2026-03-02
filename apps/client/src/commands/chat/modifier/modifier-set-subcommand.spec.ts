/**
 * Unit tests for ModifierSetSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SheetAdjustmentTypeEnum } from '@kobold/db';
import { ModifierCommand } from './modifier-command.js';
import { ModifierSetSubCommand } from './modifier-set-subcommand.js';
import {
	createTestHarness,
	createMockCharacter,
	setupKoboldUtilsMocks,
	setupAutocompleteKoboldMocks,
	setupModifierModelMock,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
	getMockKobold,
	resetMockKobold,
	type MockCreature,
} from '../../../test-utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { InputParseUtils } from '../../../utils/input-parse-utils.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-helpers/finder-helpers.js');
// Mock Creature to avoid complex sheetRecord validation during tests
vi.mock('../../../utils/creature.js', () => {
	const mockCreature = vi.fn(function (this: unknown) {
		return this;
	});
	(mockCreature as unknown as { fromSheetRecord: ReturnType<typeof vi.fn> }).fromSheetRecord =
		vi.fn(() => ({}));
	return { Creature: mockCreature };
});
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

describe('ModifierSetSubCommand', () => {
	const kobold = getMockKobold();

	let harness: CommandTestHarness;

	beforeEach(() => {
		resetMockKobold(kobold);
		harness = createTestHarness([new ModifierCommand([new ModifierSetSubCommand()])]);

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

	describe('successful modifier updates', () => {
		it('should update modifier name', async () => {
			// Arrange
			const testModifier = {
				id: 1,
				sheetRecordId: 1,
				name: 'old name',
				isActive: true,
				description: 'Test description',
				type: SheetAdjustmentTypeEnum.status,
				severity: null,
				sheetAdjustments: [],
				rollAdjustment: '+1',
				rollTargetTags: 'attack',
				note: null,
			};
			const mockCharacter = createMockCharacter();
			mockCharacter.modifiers = [testModifier];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getModifierByName')
				.mockReturnValueOnce(testModifier) // First call finds the modifier
				.mockReturnValueOnce(undefined); // Second call checks new name doesn't exist
			const { updateMock } = setupModifierModelMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'set',
				options: {
					name: 'old name',
					option: 'name',
					value: 'new name',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should update modifier description', async () => {
			// Arrange
			const testModifier = {
				id: 1,
				sheetRecordId: 1,
				name: 'test modifier',
				isActive: true,
				description: 'Old description',
				type: SheetAdjustmentTypeEnum.status,
				severity: null,
				sheetAdjustments: [],
				rollAdjustment: '+1',
				rollTargetTags: 'attack',
				note: null,
			};
			const mockCharacter = createMockCharacter();
			mockCharacter.modifiers = [testModifier];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getModifierByName').mockReturnValue(testModifier);
			const { updateMock } = setupModifierModelMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'set',
				options: {
					name: 'test modifier',
					option: 'description',
					value: 'New description',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should update modifier roll adjustment', async () => {
			// Arrange
			const testModifier = {
				id: 1,
				sheetRecordId: 1,
				name: 'test modifier',
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
			mockCharacter.modifiers = [testModifier];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getModifierByName').mockReturnValue(testModifier);
			const { updateMock } = setupModifierModelMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'set',
				options: {
					name: 'test modifier',
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

		it('should update modifier target tags', async () => {
			// Arrange
			const testModifier = {
				id: 1,
				sheetRecordId: 1,
				name: 'test modifier',
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
			mockCharacter.modifiers = [testModifier];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getModifierByName').mockReturnValue(testModifier);
			const { updateMock } = setupModifierModelMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'set',
				options: {
					name: 'test modifier',
					option: 'roll-target-tags',
					value: 'attack or damage',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should update modifier type', async () => {
			// Arrange
			const testModifier = {
				id: 1,
				sheetRecordId: 1,
				name: 'test modifier',
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
			mockCharacter.modifiers = [testModifier];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getModifierByName').mockReturnValue(testModifier);
			const { updateMock } = setupModifierModelMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'set',
				options: {
					name: 'test modifier',
					option: 'type',
					value: SheetAdjustmentTypeEnum.circumstance,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should update modifier severity', async () => {
			// Arrange
			const testModifier = {
				id: 1,
				sheetRecordId: 1,
				name: 'test modifier',
				isActive: true,
				description: null,
				type: SheetAdjustmentTypeEnum.status,
				severity: 1,
				sheetAdjustments: [],
				rollAdjustment: '-1',
				rollTargetTags: 'attack',
				note: null,
			};
			const mockCharacter = createMockCharacter();
			mockCharacter.modifiers = [testModifier];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getModifierByName').mockReturnValue(testModifier);
			const { updateMock } = setupModifierModelMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'set',
				options: {
					name: 'test modifier',
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

		it('should update modifier initiative note', async () => {
			// Arrange
			const testModifier = {
				id: 1,
				sheetRecordId: 1,
				name: 'test modifier',
				isActive: true,
				description: null,
				type: SheetAdjustmentTypeEnum.status,
				severity: null,
				sheetAdjustments: [],
				rollAdjustment: '+1',
				rollTargetTags: 'attack',
				note: 'Old note',
			};
			const mockCharacter = createMockCharacter();
			mockCharacter.modifiers = [testModifier];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getModifierByName').mockReturnValue(testModifier);
			const { updateMock } = setupModifierModelMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'set',
				options: {
					name: 'test modifier',
					option: 'initiative-note',
					value: 'New note',
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
			mockCharacter.modifiers = [];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getModifierByName').mockReturnValue(undefined);
			const { updateMock } = setupModifierModelMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'set',
				options: {
					name: 'nonexistent',
					option: 'description',
					value: 'New description',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).not.toHaveBeenCalled();
		});

		it('should error when trying to rename to existing modifier name', async () => {
			// Arrange
			const testModifier = {
				id: 1,
				sheetRecordId: 1,
				name: 'modifier one',
				isActive: true,
				description: null,
				type: SheetAdjustmentTypeEnum.status,
				severity: null,
				sheetAdjustments: [],
				rollAdjustment: '+1',
				rollTargetTags: 'attack',
				note: null,
			};
			const existingModifier = {
				id: 2,
				sheetRecordId: 1,
				name: 'modifier two',
				isActive: true,
				description: null,
				type: SheetAdjustmentTypeEnum.status,
				severity: null,
				sheetAdjustments: [],
				rollAdjustment: '+2',
				rollTargetTags: 'attack',
				note: null,
			};
			const mockCharacter = createMockCharacter();
			mockCharacter.modifiers = [testModifier, existingModifier];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getModifierByName')
				.mockReturnValueOnce(testModifier) // First call finds the modifier to rename
				.mockReturnValueOnce(existingModifier); // Second call finds existing with new name
			const { updateMock } = setupModifierModelMock(kobold);

			// Act - the command throws a KoboldError which is caught by the harness
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'set',
				options: {
					name: 'modifier one',
					option: 'name',
					value: 'modifier two',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - command responds with error message
			expect(result.didRespond()).toBe(true);
			expect(updateMock).not.toHaveBeenCalled();
		});
	});

	describe('autocomplete', () => {
		it('should return matching modifiers for name autocomplete', async () => {
			// Arrange
			const testModifier = {
				id: 1,
				sheetRecordId: 1,
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
			mockCharacter.modifiers = [testModifier];

			setupAutocompleteKoboldMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'matchAllModifiers').mockReturnValue([testModifier]);

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'modifier',
				subcommand: 'set',
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
				subcommand: 'set',
				focusedOption: { name: 'name', value: 'test' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.getChoices()).toEqual([]);
		});
	});
});
