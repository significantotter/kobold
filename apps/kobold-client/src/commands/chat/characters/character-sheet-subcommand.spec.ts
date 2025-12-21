/**
 * Integration tests for CharacterSheetSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SheetRecordTrackerModeEnum } from '@kobold/db';
import { CharacterCommand } from './character-command.js';
import { CharacterSheetSubCommand } from './character-sheet-subcommand.js';
import {
	createTestHarness,
	setupKoboldUtilsMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';
import { Creature } from '../../../utils/creature.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/creature.js');

describe('CharacterSheetSubCommand Integration', () => {
	let harness: CommandTestHarness;
	let sendBatchesMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		harness = createTestHarness([new CharacterCommand([new CharacterSheetSubCommand()])]);

		// Mock Creature and its compileEmbed method
		sendBatchesMock = vi.fn().mockResolvedValue(undefined);
		const mockEmbed = {
			sendBatches: sendBatchesMock,
		} as unknown as KoboldEmbed;

		vi.mocked(Creature).mockImplementation(
			() =>
				({
					compileEmbed: vi.fn().mockReturnValue(mockEmbed),
				}) as any
		);
	});


	describe('displaying character sheet', () => {
		it('should display full sheet by default', async () => {
			// Arrange
			const { mockCharacter } = setupKoboldUtilsMocks();

			// Act
			await harness.executeCommand({
				commandName: 'character',
				subcommand: 'sheet',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(Creature).toHaveBeenCalledWith(
				mockCharacter.sheetRecord,
				undefined,
				expect.anything()
			);
			expect(sendBatchesMock).toHaveBeenCalled();
		});

		it('should respect sheet style option', async () => {
			// Arrange
			setupKoboldUtilsMocks();

			// Act
			await harness.executeCommand({
				commandName: 'character',
				subcommand: 'sheet',
				options: { 'game-sheet-style': SheetRecordTrackerModeEnum.counters_only },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(sendBatchesMock).toHaveBeenCalled();
		});

		it('should handle various sheet styles', async () => {
			// Arrange
			setupKoboldUtilsMocks();

			const sheetStyles = [
				SheetRecordTrackerModeEnum.full_sheet,
				SheetRecordTrackerModeEnum.counters_only,
				SheetRecordTrackerModeEnum.basic_stats,
			];

			for (const style of sheetStyles) {
				vi.clearAllMocks();

				// Re-setup mock for each iteration
				sendBatchesMock = vi.fn().mockResolvedValue(undefined);
				const mockEmbed = {
					sendBatches: sendBatchesMock,
				} as unknown as KoboldEmbed;
				vi.mocked(Creature).mockImplementation(
					() =>
						({
							compileEmbed: vi.fn().mockReturnValue(mockEmbed),
						}) as any
				);
				setupKoboldUtilsMocks();

				// Act
				await harness.executeCommand({
					commandName: 'character',
					subcommand: 'sheet',
					options: { 'game-sheet-style': style },
					userId: TEST_USER_ID,
					guildId: TEST_GUILD_ID,
				});

				// Assert
				expect(sendBatchesMock).toHaveBeenCalled();
			}
		});
	});
});
