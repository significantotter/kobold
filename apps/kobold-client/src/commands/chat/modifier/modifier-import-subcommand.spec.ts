/**
 * Integration tests for ModifierImportSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vitestKobold } from '@kobold/db/test-utils';
import { SheetAdjustmentTypeEnum } from '@kobold/db';
import { ModifierCommand } from './modifier-command.js';
import { ModifierImportSubCommand } from './modifier-import-subcommand.js';
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
import { PasteBin } from '../../../services/pastebin/index.js';
import { TextParseHelpers } from '../../../utils/kobold-helpers/text-parse-helpers.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../services/pastebin/index.js');
vi.mock('../../../utils/kobold-helpers/text-parse-helpers.js');

describe('ModifierImportSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new ModifierCommand([new ModifierImportSubCommand()])]);
		// Mock pastebin ID parser to return a valid ID
		vi.mocked(TextParseHelpers.parsePasteBinIdFromText).mockReturnValue('abc123');
	});


	describe('successful modifier import', () => {
		it('should import modifiers with overwrite-all mode', async () => {
			// Arrange
			const existingModifiers = [
				{
					name: 'existing modifier',
					isActive: true,
					description: null,
					type: SheetAdjustmentTypeEnum.status,
					severity: null,
					sheetAdjustments: [],
					rollAdjustment: '+1',
					rollTargetTags: 'attack',
					note: null,
				},
			];
			const importedModifiers = [
				{
					name: 'imported modifier',
					isActive: true,
					description: 'Imported from pastebin',
					type: SheetAdjustmentTypeEnum.circumstance,
					severity: null,
					sheetAdjustments: [],
					rollAdjustment: '+2',
					rollTargetTags: 'skill',
					note: null,
				},
			];
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.modifiers = existingModifiers;

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			// Mock pastebin response - return the array directly so _.isArray check passes
			vi.mocked(PasteBin).mockImplementation(
				() =>
					({
						get: vi.fn().mockResolvedValue(importedModifiers),
					}) as any
			);

			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'import',
				options: {
					'import-mode': 'overwrite-all',
					url: 'https://pastebin.com/abc123',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should import modifiers with overwrite-on-conflict mode', async () => {
			// Arrange
			const existingModifiers = [
				{
					name: 'shared modifier',
					isActive: true,
					description: 'Original version',
					type: SheetAdjustmentTypeEnum.status,
					severity: null,
					sheetAdjustments: [],
					rollAdjustment: '+1',
					rollTargetTags: 'attack',
					note: null,
				},
			];
			const importedModifiers = [
				{
					name: 'shared modifier',
					isActive: false,
					description: 'Updated version',
					type: SheetAdjustmentTypeEnum.status,
					severity: 2,
					sheetAdjustments: [],
					rollAdjustment: '+3',
					rollTargetTags: 'attack',
					note: 'Updated',
				},
			];
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.modifiers = existingModifiers;

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			vi.mocked(PasteBin).mockImplementation(
				() =>
					({
						get: vi.fn().mockResolvedValue(importedModifiers),
					}) as any
			);

			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'import',
				options: {
					'import-mode': 'overwrite-on-conflict',
					url: 'https://pastebin.com/abc123',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should import modifiers with rename-on-conflict mode', async () => {
			// Arrange
			const existingModifiers = [
				{
					name: 'duplicate modifier',
					isActive: true,
					description: null,
					type: SheetAdjustmentTypeEnum.status,
					severity: null,
					sheetAdjustments: [],
					rollAdjustment: '+1',
					rollTargetTags: 'attack',
					note: null,
				},
			];
			const importedModifiers = [
				{
					name: 'duplicate modifier',
					isActive: true,
					description: 'Imported version',
					type: SheetAdjustmentTypeEnum.status,
					severity: null,
					sheetAdjustments: [],
					rollAdjustment: '+2',
					rollTargetTags: 'attack',
					note: null,
				},
			];
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.modifiers = existingModifiers;

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			vi.mocked(PasteBin).mockImplementation(
				() =>
					({
						get: vi.fn().mockResolvedValue(importedModifiers),
					}) as any
			);

			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'import',
				options: {
					'import-mode': 'rename-on-conflict',
					url: 'https://pastebin.com/abc123',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should import modifiers with ignore-on-conflict mode', async () => {
			// Arrange
			const existingModifiers = [
				{
					name: 'existing modifier',
					isActive: true,
					description: null,
					type: SheetAdjustmentTypeEnum.status,
					severity: null,
					sheetAdjustments: [],
					rollAdjustment: '+1',
					rollTargetTags: 'attack',
					note: null,
				},
			];
			const importedModifiers = [
				{
					name: 'existing modifier',
					isActive: false,
					description: 'Should be ignored',
					type: SheetAdjustmentTypeEnum.status,
					severity: null,
					sheetAdjustments: [],
					rollAdjustment: '+5',
					rollTargetTags: 'attack',
					note: null,
				},
				{
					name: 'new modifier',
					isActive: true,
					description: 'Should be added',
					type: SheetAdjustmentTypeEnum.circumstance,
					severity: null,
					sheetAdjustments: [],
					rollAdjustment: '+2',
					rollTargetTags: 'skill',
					note: null,
				},
			];
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.modifiers = existingModifiers;

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			vi.mocked(PasteBin).mockImplementation(
				() =>
					({
						get: vi.fn().mockResolvedValue(importedModifiers),
					}) as any
			);

			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'import',
				options: {
					'import-mode': 'ignore-on-conflict',
					url: 'https://pastebin.com/abc123',
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
		it('should error on invalid pastebin URL', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.modifiers = [];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });
			// Mock the parser to return null for invalid URL
			vi.mocked(TextParseHelpers.parsePasteBinIdFromText).mockReturnValue(null);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'import',
				options: {
					'import-mode': 'overwrite-all',
					url: 'invalid-url',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).not.toHaveBeenCalled();

			// Reset mock for other tests
			vi.mocked(TextParseHelpers.parsePasteBinIdFromText).mockReturnValue('abc123');
		});

		it('should error on invalid JSON from pastebin', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.modifiers = [];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			vi.mocked(PasteBin).mockImplementation(
				() =>
					({
						get: vi.fn().mockResolvedValue('not valid json'),
					}) as any
			);

			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'import',
				options: {
					'import-mode': 'overwrite-all',
					url: 'https://pastebin.com/abc123',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).not.toHaveBeenCalled();
		});

		it('should error on invalid modifier schema from pastebin', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.modifiers = [];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			// Invalid modifier - wrong type for required field
			const invalidModifiers = [
				{
					name: 12345, // Should be a string
					isActive: 'not a boolean', // Should be a boolean
				},
			];

			vi.mocked(PasteBin).mockImplementation(
				() =>
					({
						get: vi.fn().mockResolvedValue(JSON.stringify(invalidModifiers)),
					}) as any
			);

			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'import',
				options: {
					'import-mode': 'overwrite-all',
					url: 'https://pastebin.com/abc123',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).not.toHaveBeenCalled();
		});
	});
});
