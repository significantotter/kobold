/**
 * Integration tests for RollDiceSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RollCommand } from './roll-command.js';
import { RollDiceSubCommand } from './roll-dice-subcommand.js';
import {
	createTestHarness,
	setupKoboldUtilsMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
	type MockRollBuilder,
} from '../../../test-utils/index.js';
import { EmbedUtils } from '../../../utils/kobold-embed-utils.js';
import { RollBuilder } from '../../../utils/roll-builder.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-embed-utils.js');
vi.mock('../../../utils/roll-builder.js');

describe('RollDiceSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new RollCommand([new RollDiceSubCommand()])]);

		// Mock RollBuilder to return a mock embed
		vi.mocked(RollBuilder).mockImplementation(function (this: MockRollBuilder) {
			this.addRoll = vi.fn(() => {});
			(this as MockRollBuilder & { rollResults: unknown[] }).rollResults = [
				{ results: { errors: [] } },
			];
			this.compileEmbed = vi.fn(() => ({ data: { description: 'Roll result' } }));
			return this;
		} as unknown as () => RollBuilder);

		// Mock EmbedUtils.dispatchEmbeds
		vi.mocked(EmbedUtils.dispatchEmbeds).mockResolvedValue(undefined);
	});

	describe('successful dice rolls', () => {
		it('should roll a simple dice expression', async () => {
			// Arrange
			setupKoboldUtilsMocks();

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll',
				subcommand: 'dice',
				options: {
					dice: '1d20',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - When using mocked EmbedUtils.dispatchEmbeds, check it was called instead of didRespond()
			expect(RollBuilder).toHaveBeenCalled();
			expect(EmbedUtils.dispatchEmbeds).toHaveBeenCalled();
		});

		it('should roll a complex dice expression', async () => {
			// Arrange
			setupKoboldUtilsMocks();

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll',
				subcommand: 'dice',
				options: {
					dice: '2d6+4+1d4',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(RollBuilder).toHaveBeenCalled();
			expect(EmbedUtils.dispatchEmbeds).toHaveBeenCalled();
		});

		it('should roll with a note', async () => {
			// Arrange
			setupKoboldUtilsMocks();

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll',
				subcommand: 'dice',
				options: {
					dice: '1d20+5',
					note: 'Attack roll',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(RollBuilder).toHaveBeenCalledWith(
				expect.objectContaining({
					rollNote: 'Attack roll',
				})
			);
			expect(EmbedUtils.dispatchEmbeds).toHaveBeenCalled();
		});

		it('should handle secret roll option', async () => {
			// Arrange
			setupKoboldUtilsMocks();

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll',
				subcommand: 'dice',
				options: {
					dice: '1d20',
					secret: 'secret',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - dispatchEmbeds is called with: intr, [embed], secretRoll, gmUserId
			// gmUserId can be undefined for non-game characters
			expect(EmbedUtils.dispatchEmbeds).toHaveBeenCalledWith(
				expect.anything(), // interaction
				expect.anything(), // embeds array
				'secret', // secretRoll value
				undefined // gmUserId (no game for mock character)
			);
		});

		it('should use public roll by default', async () => {
			// Arrange
			setupKoboldUtilsMocks();

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll',
				subcommand: 'dice',
				options: {
					dice: '1d20',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(EmbedUtils.dispatchEmbeds).toHaveBeenCalledWith(
				expect.anything(),
				expect.anything(),
				'public',
				undefined // gmUserId (no game for mock character)
			);
		});

		it('should roll dice with character attribute reference', async () => {
			// Arrange
			setupKoboldUtilsMocks();

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll',
				subcommand: 'dice',
				options: {
					dice: '1d20+[strength]',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			// When using character attributes, the character should be passed to RollBuilder
			expect(RollBuilder).toHaveBeenCalledWith(
				expect.objectContaining({
					character: expect.anything(),
				})
			);
			expect(EmbedUtils.dispatchEmbeds).toHaveBeenCalled();
		});
	});

	describe('roll options', () => {
		it('should handle secret-and-notify option', async () => {
			// Arrange
			setupKoboldUtilsMocks();

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll',
				subcommand: 'dice',
				options: {
					dice: '1d20',
					secret: 'secret-and-notify',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(EmbedUtils.dispatchEmbeds).toHaveBeenCalledWith(
				expect.anything(),
				expect.anything(),
				'secret-and-notify',
				undefined // gmUserId (no game for mock character)
			);
		});

		it('should handle send-to-gm option', async () => {
			// Arrange
			setupKoboldUtilsMocks();

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll',
				subcommand: 'dice',
				options: {
					dice: '1d20',
					secret: 'send-to-gm',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(EmbedUtils.dispatchEmbeds).toHaveBeenCalledWith(
				expect.anything(),
				expect.anything(),
				'send-to-gm',
				undefined // gmUserId (no game for mock character)
			);
		});
	});
});
