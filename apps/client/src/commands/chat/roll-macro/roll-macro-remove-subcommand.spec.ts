/**
 * Unit tests for RollMacroRemoveSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RollMacroCommand } from './roll-macro-command.js';
import { RollMacroRemoveSubCommand } from './roll-macro-remove-subcommand.js';
import {
	createTestHarness,
	createMockCharacter,
	setupKoboldUtilsMocks,
	setupAutocompleteKoboldMocks,
	setupRollMacroModelMock,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
	getMockKobold,
	resetMockKobold,
	type MockKoboldUtils,
} from '../../../test-utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { CollectorUtils } from '../../../utils/collector-utils.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-helpers/finder-helpers.js');
vi.mock('../../../utils/collector-utils.js');

describe('RollMacroRemoveSubCommand', () => {
	const kobold = getMockKobold();

	let harness: CommandTestHarness;

	beforeEach(() => {
		resetMockKobold(kobold);
		harness = createTestHarness([new RollMacroCommand([new RollMacroRemoveSubCommand()])]);
	});

	describe('removing roll macros', () => {
		it('should remove a roll macro when confirmed', async () => {
			// Arrange
			const existingMacro = { id: 1, name: 'sneak-attack', macro: '2d6', sheetRecordId: 1 };
			const mockCharacter = createMockCharacter();
			mockCharacter.rollMacros = [existingMacro];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getRollMacroByName').mockReturnValue(existingMacro);
			const { deleteMock } = setupRollMacroModelMock(kobold);

			// Mock the button collector to return 'remove'
			vi.mocked(CollectorUtils.collectByButton).mockResolvedValue({
				intr: {} as any,
				value: 'remove',
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll-macro',
				subcommand: 'remove',
				options: {
					name: 'sneak-attack',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(deleteMock).toHaveBeenCalled();
		});

		it('should cancel removal when canceled', async () => {
			// Arrange
			const existingMacro = { id: 1, name: 'sneak-attack', macro: '2d6', sheetRecordId: 1 };
			const mockCharacter = createMockCharacter();
			mockCharacter.rollMacros = [existingMacro];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getRollMacroByName').mockReturnValue(existingMacro);
			const { deleteMock } = setupRollMacroModelMock(kobold);

			// Mock the button collector to return 'cancel'
			vi.mocked(CollectorUtils.collectByButton).mockResolvedValue({
				intr: {} as any,
				value: 'cancel',
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll-macro',
				subcommand: 'remove',
				options: {
					name: 'sneak-attack',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(deleteMock).not.toHaveBeenCalled();
		});

		it('should error when roll macro not found', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			mockCharacter.rollMacros = [];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getRollMacroByName').mockReturnValue(undefined);
			const { deleteMock } = setupRollMacroModelMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll-macro',
				subcommand: 'remove',
				options: {
					name: 'nonexistent-macro',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(deleteMock).not.toHaveBeenCalled();
			const response = result.getResponseContent();
			expect(response).toContain("couldn't find");
		});
	});

	describe('autocomplete', () => {
		it('should return matching roll macros for autocomplete', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			mockCharacter.rollMacros = [
				{ id: 1, name: 'sneak-attack', macro: '2d6', sheetRecordId: 1 },
				{ id: 2, name: 'sneak-damage', macro: '3d6', sheetRecordId: 1 },
				{ id: 3, name: 'power-attack', macro: '4', sheetRecordId: 1 },
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
				subcommand: 'remove',
				focusedOption: { name: 'name', value: 'sneak' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.getChoices()).toBeDefined();
		});
	});
});
