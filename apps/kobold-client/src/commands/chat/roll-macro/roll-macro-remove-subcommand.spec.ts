/**
 * Integration tests for RollMacroRemoveSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vitestKobold } from '@kobold/db/test-utils';
import { RollMacroCommand } from './roll-macro-command.js';
import { RollMacroRemoveSubCommand } from './roll-macro-remove-subcommand.js';
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
import { CollectorUtils } from '../../../utils/collector-utils.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-helpers/finder-helpers.js');
vi.mock('../../../utils/collector-utils.js');

describe('RollMacroRemoveSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new RollMacroCommand([new RollMacroRemoveSubCommand()])]);
	});


	describe('removing roll macros', () => {
		it('should remove a roll macro when confirmed', async () => {
			// Arrange
			const existingMacro = { name: 'sneak-attack', macro: '2d6' };
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.rollMacros = [existingMacro];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getRollMacroByName').mockReturnValue(existingMacro);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

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
			expect(updateMock).toHaveBeenCalled();
		});

		it('should cancel removal when canceled', async () => {
			// Arrange
			const existingMacro = { name: 'sneak-attack', macro: '2d6' };
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.rollMacros = [existingMacro];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getRollMacroByName').mockReturnValue(existingMacro);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

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
			expect(updateMock).not.toHaveBeenCalled();
		});

		it('should error when roll macro not found', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.rollMacros = [];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getRollMacroByName').mockReturnValue(undefined);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

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
			expect(updateMock).not.toHaveBeenCalled();
			const response = result.getResponseContent();
			expect(response).toContain("couldn't find");
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

			vi.mocked(KoboldUtils).mockImplementation(
				() =>
					({
						autocompleteUtils: {
							getAllMatchingRollsMacrosForCharacter: vi.fn().mockResolvedValue([
								{ name: 'sneak-attack', value: 'sneak-attack' },
								{ name: 'sneak-damage', value: 'sneak-damage' },
							]),
						},
						fetchNonNullableDataForCommand: vi.fn().mockResolvedValue({
							activeCharacter: mockCharacter,
						}),
					}) as any
			);

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
