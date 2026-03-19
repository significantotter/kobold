/**
 * Unit tests for ModifierCreateSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SheetAdjustmentTypeEnum } from '@kobold/db';
import { ModifierCommand } from './modifier-command.js';
import { ModifierCreateSubCommand } from './modifier-create-subcommand.js';
import {
	createTestHarness,
	createMockCharacter,
	setupKoboldUtilsMocks,
	setupModifierModelMock,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
	getMockKobold,
	resetMockKobold,
} from '../../../test-utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { InputParseUtils } from '../../../utils/input-parse-utils.js';
import { SheetUtils } from '../../../utils/sheet/sheet-utils.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-helpers/finder-helpers.js');
vi.mock('../../../utils/sheet/sheet-utils.js', () => ({
	SheetUtils: {
		adjustSheetWithModifiers: vi.fn(() => ({})),
	},
}));
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

describe('ModifierCreateSubCommand', () => {
	const kobold = getMockKobold();

	let harness: CommandTestHarness;

	beforeEach(() => {
		resetMockKobold(kobold);
		harness = createTestHarness([new ModifierCommand([new ModifierCreateSubCommand()])]);
	});

	describe('successful modifier creation', () => {
		it('should create a modifier with roll adjustment and target tags', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			mockCharacter.modifiers = [];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getModifierByName').mockReturnValue(undefined);
			const { createMock } = setupModifierModelMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'create',
				options: {
					name: 'Inspire Courage',
					type: SheetAdjustmentTypeEnum.status,
					'roll-adjustment': '+1',
					'roll-target-tags': 'attack or damage',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(createMock).toHaveBeenCalled();
		});

		it('should create a modifier with sheet values', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			mockCharacter.modifiers = [];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getModifierByName').mockReturnValue(undefined);
			const { createMock } = setupModifierModelMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'create',
				options: {
					name: 'Strength Boost',
					type: SheetAdjustmentTypeEnum.status,
					'sheet-values': 'strength +2',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(createMock).toHaveBeenCalled();
		});

		it('should create a modifier with severity', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			mockCharacter.modifiers = [];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getModifierByName').mockReturnValue(undefined);
			const { createMock } = setupModifierModelMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'create',
				options: {
					name: 'Frightened',
					type: SheetAdjustmentTypeEnum.status,
					severity: '2',
					'sheet-values': 'ac -2',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(createMock).toHaveBeenCalled();
		});

		it('should create a modifier with description and initiative note', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			mockCharacter.modifiers = [];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getModifierByName').mockReturnValue(undefined);
			const { createMock } = setupModifierModelMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'create',
				options: {
					name: 'Bard Song',
					type: SheetAdjustmentTypeEnum.status,
					'roll-adjustment': '+1',
					'roll-target-tags': 'attack',
					description: 'A rousing battle song',
					'initiative-note': 'Song Active',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(createMock).toHaveBeenCalled();
		});
	});

	describe('error handling', () => {
		it('should error when modifier with same name already exists', async () => {
			// Arrange
			const existingModifier = {
				id: 1,
				name: 'existing modifier',
				isActive: true,
				description: '',
				type: SheetAdjustmentTypeEnum.status,
				severity: null,
				sheetAdjustments: [],
				rollAdjustment: '+1',
				rollTargetTags: 'attack',
				note: null,
				sheetRecordId: 1,
				userId: TEST_USER_ID,
			};
			const mockCharacter = createMockCharacter();
			mockCharacter.modifiers = [existingModifier];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getModifierByName').mockReturnValue(existingModifier);
			const { createMock } = setupModifierModelMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'create',
				options: {
					name: 'Existing Modifier',
					type: SheetAdjustmentTypeEnum.status,
					'roll-adjustment': '+2',
					'roll-target-tags': 'attack',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(createMock).not.toHaveBeenCalled();
		});

		it('should error when roll adjustment is provided without target tags', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			mockCharacter.modifiers = [];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getModifierByName').mockReturnValue(undefined);
			const { createMock } = setupModifierModelMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'create',
				options: {
					name: 'Invalid Modifier',
					type: SheetAdjustmentTypeEnum.status,
					'roll-adjustment': '+1',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(createMock).not.toHaveBeenCalled();
		});

		it('should error when target tags are provided without roll adjustment', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			mockCharacter.modifiers = [];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getModifierByName').mockReturnValue(undefined);
			const { createMock } = setupModifierModelMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'create',
				options: {
					name: 'Invalid Modifier',
					type: SheetAdjustmentTypeEnum.status,
					'roll-target-tags': 'attack',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(createMock).not.toHaveBeenCalled();
		});

		it('should error when neither roll adjustment nor sheet values provided', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			mockCharacter.modifiers = [];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getModifierByName').mockReturnValue(undefined);
			const { createMock } = setupModifierModelMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'create',
				options: {
					name: 'Empty Modifier',
					type: SheetAdjustmentTypeEnum.status,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(createMock).not.toHaveBeenCalled();
		});
	});
});
