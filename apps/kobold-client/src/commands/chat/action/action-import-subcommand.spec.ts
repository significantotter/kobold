/**
 * Unit tests for ActionImportSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActionTypeEnum, ActionCostEnum } from '@kobold/db';
import { ActionImportModeChoices } from '@kobold/documentation';
import { ActionCommand } from './action-command.js';
import { ActionImportSubCommand } from './action-import-subcommand.js';
import { PasteBin } from '../../../services/pastebin/index.js';
import { TextParseHelpers } from '../../../utils/kobold-helpers/text-parse-helpers.js';
import {
	createTestHarness,
	createMockAction,
	setupKoboldUtilsMocks,
	setupSheetRecordUpdateMock,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
	getMockKobold,
	resetMockKobold,
	type MockPasteBin,
} from '../../../test-utils/index.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../services/pastebin/index.js');
vi.mock('../../../utils/kobold-helpers/text-parse-helpers.js');

describe('ActionImportSubCommand', () => {
	const kobold = getMockKobold();

	let harness: CommandTestHarness;

	beforeEach(() => {
		resetMockKobold(kobold);
		harness = createTestHarness([new ActionCommand([new ActionImportSubCommand()])]);
	});

	describe('successful action import', () => {
		it('should import actions with overwrite-all mode', async () => {
			// Arrange
			const importedActions = [
				createMockAction({ name: 'Imported Strike', description: 'An imported attack' }),
			];

			setupKoboldUtilsMocks({ actions: [] });
			vi.spyOn(TextParseHelpers, 'parsePasteBinIdFromText').mockReturnValue('abc123');
			vi.mocked(PasteBin).mockImplementation(function (this: MockPasteBin) {
				this.get = vi.fn(async () => JSON.stringify(importedActions));
				return this;
			} as unknown as () => PasteBin);
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action',
				subcommand: 'import',
				options: {
					url: 'https://pastebin.com/abc123',
					mode: ActionImportModeChoices.overwriteAll,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should import actions with overwrite-on-conflict mode', async () => {
			// Arrange
			const existingAction = createMockAction({
				name: 'Existing Action',
				description: 'Already here',
				type: ActionTypeEnum.other,
				actionCost: ActionCostEnum.freeAction,
			});
			const importedActions = [
				createMockAction({
					name: 'Existing Action',
					description: 'Updated version',
					type: ActionTypeEnum.attack,
				}),
			];

			setupKoboldUtilsMocks({ actions: [existingAction] });
			vi.spyOn(TextParseHelpers, 'parsePasteBinIdFromText').mockReturnValue('abc123');
			vi.mocked(PasteBin).mockImplementation(function (this: MockPasteBin) {
				this.get = vi.fn(async () => JSON.stringify(importedActions));
				return this;
			} as unknown as () => PasteBin);
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action',
				subcommand: 'import',
				options: {
					url: 'https://pastebin.com/abc123',
					mode: ActionImportModeChoices.overwriteOnConflict,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should import actions with rename-on-conflict mode', async () => {
			// Arrange
			const importedActions = [
				createMockAction({
					name: 'New Action',
					type: ActionTypeEnum.spell,
					actionCost: ActionCostEnum.twoActions,
					baseLevel: 1,
					autoHeighten: true,
					tags: ['magic'],
				}),
			];

			setupKoboldUtilsMocks({ actions: [] });
			vi.spyOn(TextParseHelpers, 'parsePasteBinIdFromText').mockReturnValue('abc123');
			vi.mocked(PasteBin).mockImplementation(function (this: MockPasteBin) {
				this.get = vi.fn(async () => JSON.stringify(importedActions));
				return this;
			} as unknown as () => PasteBin);
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action',
				subcommand: 'import',
				options: {
					url: 'https://pastebin.com/abc123',
					mode: ActionImportModeChoices.renameOnConflict,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should import actions with ignore-on-conflict mode', async () => {
			// Arrange
			const importedActions = [
				createMockAction({
					name: 'Ignored If Exists',
					type: ActionTypeEnum.other,
					actionCost: ActionCostEnum.reaction,
				}),
			];

			setupKoboldUtilsMocks({ actions: [] });
			vi.spyOn(TextParseHelpers, 'parsePasteBinIdFromText').mockReturnValue('abc123');
			vi.mocked(PasteBin).mockImplementation(function (this: MockPasteBin) {
				this.get = vi.fn(async () => JSON.stringify(importedActions));
				return this;
			} as unknown as () => PasteBin);
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action',
				subcommand: 'import',
				options: {
					url: 'https://pastebin.com/abc123',
					mode: ActionImportModeChoices.ignoreOnConflict,
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
		it('should reject invalid PasteBin URL', async () => {
			// Arrange
			setupKoboldUtilsMocks();
			vi.spyOn(TextParseHelpers, 'parsePasteBinIdFromText').mockReturnValue(null);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action',
				subcommand: 'import',
				options: {
					url: 'not-a-valid-url',
					mode: ActionImportModeChoices.overwriteAll,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(result.getResponseContent()).toBeDefined();
		});

		it('should handle invalid JSON from PasteBin', async () => {
			vi.spyOn(console, 'warn').mockImplementation(() => {});

			// Arrange
			setupKoboldUtilsMocks();
			vi.spyOn(TextParseHelpers, 'parsePasteBinIdFromText').mockReturnValue('abc123');
			vi.mocked(PasteBin).mockImplementation(function (this: MockPasteBin) {
				this.get = vi.fn(async () => 'not valid json {{{');
				return this;
			} as unknown as () => PasteBin);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action',
				subcommand: 'import',
				options: {
					url: 'https://pastebin.com/abc123',
					mode: ActionImportModeChoices.overwriteAll,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(result.getResponseContent()).toBeDefined();
		});
	});
});
