/**
 * Unit tests for RollMacroSetSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RollMacroCommand } from './roll-macro-command.js';
import { RollMacroSetSubCommand } from './roll-macro-set-subcommand.js';
import {
	createTestHarness,
	createMockCharacter,
	setupKoboldUtilsMocks,
	setupSheetRecordUpdateMock,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
	getMockKobold,
	resetMockKobold,
	type MockRollBuilder,
	type MockKoboldUtils,
} from '../../../test-utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { RollBuilder } from '../../../utils/roll-builder.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-helpers/finder-helpers.js');
vi.mock('../../../utils/roll-builder.js');

describe('RollMacroSetSubCommand', () => {
	const kobold = getMockKobold();

	let harness: CommandTestHarness;

	beforeEach(() => {
		resetMockKobold(kobold);
		harness = createTestHarness([new RollMacroCommand([new RollMacroSetSubCommand()])]);

		// Default RollBuilder mock - returns valid roll
		vi.mocked(RollBuilder).mockImplementation(function (this: MockRollBuilder) {
			this.addRoll = vi.fn(() => {});
			(this as MockRollBuilder & { rollResults: unknown[] }).rollResults = [
				{ results: { errors: [] } },
			];
			return this;
		} as unknown as () => RollBuilder);
	});

	describe('setting roll macro values', () => {
		it('should update an existing roll macro', async () => {
			// Arrange
			const existingMacro = { name: 'sneak-attack', macro: '2d6' };
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.rollMacros = [existingMacro];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getRollMacroByName').mockReturnValue(existingMacro);
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll-macro',
				subcommand: 'set',
				options: {
					name: 'sneak-attack',
					value: '3d6',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should update roll macro to use attribute references', async () => {
			// Arrange
			const existingMacro = { name: 'bonus', macro: '5' };
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.rollMacros = [existingMacro];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getRollMacroByName').mockReturnValue(existingMacro);
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll-macro',
				subcommand: 'set',
				options: {
					name: 'bonus',
					value: '[str]+[dex]',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should update roll macro to a static value', async () => {
			// Arrange
			const existingMacro = { name: 'flat-bonus', macro: '1d4' };
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.rollMacros = [existingMacro];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getRollMacroByName').mockReturnValue(existingMacro);
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll-macro',
				subcommand: 'set',
				options: {
					name: 'flat-bonus',
					value: '10',
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
		it('should error when roll macro not found', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.rollMacros = [];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getRollMacroByName').mockReturnValue(undefined);
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll-macro',
				subcommand: 'set',
				options: {
					name: 'nonexistent-macro',
					value: '5',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).not.toHaveBeenCalled();
			const response = result.getResponseContent();
			expect(response).toContain("couldn't find");
		});

		it('should error when new value is invalid', async () => {
			// Arrange
			const existingMacro = { name: 'test-macro', macro: '1d6' };
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.rollMacros = [existingMacro];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getRollMacroByName').mockReturnValue(existingMacro);
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Mock RollBuilder to return an error
			vi.mocked(RollBuilder).mockImplementation(function (this: MockRollBuilder) {
				this.addRoll = vi.fn(() => {});
				(this as MockRollBuilder & { rollResults: unknown[] }).rollResults = [
					{ results: { errors: ['Invalid expression'] } },
				];
				return this;
			} as unknown as () => RollBuilder);

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll-macro',
				subcommand: 'set',
				options: {
					name: 'test-macro',
					value: 'invalid roll expression',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).not.toHaveBeenCalled();
			const response = result.getResponseContent();
			expect(response).toContain('error');
		});
	});

	describe('autocomplete', () => {
		it('should return matching roll macros for autocomplete', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.rollMacros = [
				{ name: 'sneak-attack', macro: '2d6' },
				{ name: 'sneak-damage', macro: '3d6' },
				{ name: 'power-attack', macro: '4' },
			];

			vi.mocked(KoboldUtils).mockImplementation(function (this: MockKoboldUtils) {
				(this as MockKoboldUtils & { autocompleteUtils: unknown }).autocompleteUtils = {
					getAllMatchingRollsMacrosForCharacter: vi.fn(async () => [
						{ name: 'sneak-attack', value: 'sneak-attack' },
						{ name: 'sneak-damage', value: 'sneak-damage' },
					]),
				};
				this.fetchNonNullableDataForCommand = vi.fn(async () => ({
					activeCharacter: mockCharacter,
				}));
				return this;
			} as unknown as () => KoboldUtils);

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'roll-macro',
				subcommand: 'set',
				focusedOption: { name: 'name', value: 'sneak' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.getChoices()).toBeDefined();
		});

		it('should return empty array when no character is active', async () => {
			// Arrange
			vi.mocked(KoboldUtils).mockImplementation(function (this: MockKoboldUtils) {
				(this as MockKoboldUtils & { autocompleteUtils: unknown }).autocompleteUtils = {
					getAllMatchingRollsMacrosForCharacter: vi.fn(async () => []),
				};
				this.fetchNonNullableDataForCommand = vi.fn(async () => ({
					activeCharacter: null,
				}));
				return this;
			} as unknown as () => KoboldUtils);

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'roll-macro',
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
