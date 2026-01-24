/**
 * Integration tests for CharacterSheetSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CharacterCommand } from './character-command.js';
import { CharacterSheetSubCommand } from './character-sheet-subcommand.js';
import {
	createTestHarness,
	setupKoboldUtilsMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
	type MockCreature,
} from '../../../test-utils/index.js';
import { Creature } from '../../../utils/creature.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { sharedStrings } from '@kobold/documentation';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/creature.js');

describe('CharacterSheetSubCommand Integration', () => {
	let harness: CommandTestHarness;
	let sendBatchesMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		harness = createTestHarness([new CharacterCommand([new CharacterSheetSubCommand()])]);

		// Mock Creature and its compileEmbed method
		sendBatchesMock = vi.fn(async () => undefined);
		const mockEmbed = {
			sendBatches: sendBatchesMock,
		} as unknown as KoboldEmbed;

		vi.mocked(Creature).mockImplementation(function (this: MockCreature) {
			this.compendiumEntry = vi.fn(() => mockEmbed);
			(this as MockCreature & { compileEmbed: ReturnType<typeof vi.fn> }).compileEmbed =
				vi.fn(() => mockEmbed);
			return this;
		} as unknown as () => Creature);
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
				options: { 'game-sheet-style': sharedStrings.options.sheetStyles.countersOnly },
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
				sharedStrings.options.sheetStyles.fullSheet,
				sharedStrings.options.sheetStyles.countersOnly,
				sharedStrings.options.sheetStyles.basicStats,
			];

			for (const style of sheetStyles) {
				vi.clearAllMocks();

				// Re-setup mock for each iteration
				sendBatchesMock = vi.fn(async () => undefined);
				const mockEmbed = {
					sendBatches: sendBatchesMock,
				} as unknown as KoboldEmbed;
				vi.mocked(Creature).mockImplementation(function (this: MockCreature) {
					this.compendiumEntry = vi.fn(() => mockEmbed);
					(
						this as MockCreature & { compileEmbed: ReturnType<typeof vi.fn> }
					).compileEmbed = vi.fn(() => mockEmbed);
					return this;
				} as unknown as () => Creature);
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
