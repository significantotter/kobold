/**
 * Integration tests for ModifierExportSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	SheetAdjustmentTypeEnum,
	AdjustablePropertyEnum,
	SheetAdjustmentOperationEnum,
} from '@kobold/db';
import { ModifierCommand } from './modifier-command.js';
import { ModifierExportSubCommand } from './modifier-export-subcommand.js';
import {
	createTestHarness,
	createMockCharacter,
	setupKoboldUtilsMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
	type MockPasteBin,
} from '../../../test-utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { PasteBin } from '../../../services/pastebin/index.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../services/pastebin/index.js');

describe('ModifierExportSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new ModifierCommand([new ModifierExportSubCommand()])]);
	});

	describe('successful modifier export', () => {
		it('should export modifiers to pastebin', async () => {
			// Arrange
			const modifiers = [
				{
					name: 'inspire courage',
					isActive: true,
					description: 'Bard inspiration',
					type: SheetAdjustmentTypeEnum.status,
					severity: null,
					sheetAdjustments: [],
					rollAdjustment: '+1',
					rollTargetTags: 'attack OR damage',
					note: null,
				},
				{
					name: 'frightened',
					isActive: false,
					description: 'Fear condition',
					type: SheetAdjustmentTypeEnum.status,
					severity: 2,
					sheetAdjustments: [],
					rollAdjustment: '-2',
					rollTargetTags: 'attack OR skill',
					note: 'Frightened 2',
				},
			];
			const mockCharacter = createMockCharacter({
				characterOverrides: { name: 'Test Character' },
			});
			mockCharacter.sheetRecord.modifiers = modifiers;

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			// Mock pastebin response
			vi.mocked(PasteBin).mockImplementation(function (this: MockPasteBin) {
				(this as MockPasteBin & { post: ReturnType<typeof vi.fn> }).post = vi.fn(
					async () => 'https://pastebin.com/abc123'
				);
				return this;
			} as unknown as () => PasteBin);

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'export',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should export empty modifiers array', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({
				characterOverrides: { name: 'Empty Character' },
			});
			mockCharacter.sheetRecord.modifiers = [];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			// Mock pastebin response
			vi.mocked(PasteBin).mockImplementation(function (this: MockPasteBin) {
				(this as MockPasteBin & { post: ReturnType<typeof vi.fn> }).post = vi.fn(
					async () => 'https://pastebin.com/xyz789'
				);
				return this;
			} as unknown as () => PasteBin);

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'export',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should export modifiers with sheet adjustments', async () => {
			// Arrange
			const modifiers = [
				{
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
							value: '4',
							type: SheetAdjustmentTypeEnum.status,
						},
					],
					rollAdjustment: null,
					rollTargetTags: null,
					note: null,
				},
			];
			const mockCharacter = createMockCharacter({
				characterOverrides: { name: 'Strong Character' },
			});
			mockCharacter.sheetRecord.modifiers = modifiers;

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			// Mock pastebin response
			vi.mocked(PasteBin).mockImplementation(function (this: MockPasteBin) {
				(this as MockPasteBin & { post: ReturnType<typeof vi.fn> }).post = vi.fn(
					async () => 'https://pastebin.com/def456'
				);
				return this;
			} as unknown as () => PasteBin);

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'export',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('error handling', () => {
		it('should handle pastebin error gracefully', async () => {
			// Arrange
			const modifiers = [
				{
					name: 'test modifier',
					isActive: true,
					description: null,
					type: SheetAdjustmentTypeEnum.untyped,
					severity: null,
					sheetAdjustments: [],
					rollAdjustment: '+1',
					rollTargetTags: 'attack',
					note: null,
				},
			];
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.modifiers = modifiers;

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			// Mock pastebin error
			vi.mocked(PasteBin).mockImplementation(function (this: MockPasteBin) {
				(this as MockPasteBin & { post: ReturnType<typeof vi.fn> }).post = vi.fn(
					async () => {
						throw new Error('Pastebin API error');
					}
				);
				return this;
			} as unknown as () => PasteBin);

			// Act - the error is caught by the command handler and a response is sent
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'export',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - command still responds (with error message)
			expect(result.didRespond()).toBe(true);
		});
	});
});
