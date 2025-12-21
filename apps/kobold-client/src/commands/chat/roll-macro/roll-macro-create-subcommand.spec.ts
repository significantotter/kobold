/**
 * Integration tests for RollMacroCreateSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vitestKobold } from '@kobold/db/test-utils';
import { RollMacroCommand } from './roll-macro-command.js';
import { RollMacroCreateSubCommand } from './roll-macro-create-subcommand.js';
import {
	createTestHarness,
	createMockCharacter,
	setupKoboldUtilsMocks,
	setupSheetRecordUpdateMock,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { RollBuilder } from '../../../utils/roll-builder.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-helpers/finder-helpers.js');
vi.mock('../../../utils/roll-builder.js');

describe('RollMacroCreateSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new RollMacroCommand([new RollMacroCreateSubCommand()])]);

		// Default RollBuilder mock - returns valid roll
		vi.mocked(RollBuilder).mockImplementation(
			() =>
				({
					addRoll: vi.fn(),
					rollResults: [{ results: { errors: [] } }],
				}) as any
		);
	});


	describe('successful roll macro creation', () => {
		it('should create a simple roll macro', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.rollMacros = [];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getRollMacroByName').mockReturnValue(undefined);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll-macro',
				subcommand: 'create',
				options: {
					name: 'sneak-attack',
					value: '2d6',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
			const response = result.getResponseContent();
			expect(response).toContain('sneak-attack');
		});

		it('should create a roll macro with attribute reference', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.rollMacros = [];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getRollMacroByName').mockReturnValue(undefined);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll-macro',
				subcommand: 'create',
				options: {
					name: 'str-bonus',
					value: 'd4+[str]',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should create a roll macro with static value', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.rollMacros = [];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getRollMacroByName').mockReturnValue(undefined);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll-macro',
				subcommand: 'create',
				options: {
					name: 'flat-bonus',
					value: '5',
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
		it('should error when roll macro with same name already exists', async () => {
			// Arrange
			const existingMacro = { name: 'existing-macro', macro: '1d6' };
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.rollMacros = [existingMacro];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getRollMacroByName').mockReturnValue(existingMacro);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll-macro',
				subcommand: 'create',
				options: {
					name: 'existing-macro',
					value: '2d6',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).not.toHaveBeenCalled();
			const response = result.getResponseContent();
			expect(response).toContain('already exists');
		});

		it('should error when macro expression is invalid', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.rollMacros = [];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			vi.spyOn(FinderHelpers, 'getRollMacroByName').mockReturnValue(undefined);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Mock RollBuilder to return an error
			vi.mocked(RollBuilder).mockImplementation(
				() =>
					({
						addRoll: vi.fn(),
						rollResults: [{ error: true, results: { errors: ['Invalid expression'] } }],
					}) as any
			);

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll-macro',
				subcommand: 'create',
				options: {
					name: 'invalid-macro',
					value: 'not a valid roll',
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
});
