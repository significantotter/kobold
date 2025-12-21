/**
 * Integration tests for RollPerceptionSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RollCommand } from './roll-command.js';
import { RollPerceptionSubCommand } from './roll-perception-subcommand.js';
import {
	createTestHarness,
	createMockCharacter,
	setupKoboldUtilsMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';
import { EmbedUtils } from '../../../utils/kobold-embed-utils.js';
import { RollBuilder } from '../../../utils/roll-builder.js';
import { Creature } from '../../../utils/creature.js';
import { DiceUtils } from '../../../utils/dice-utils.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-embed-utils.js');
vi.mock('../../../utils/roll-builder.js');
vi.mock('../../../utils/creature.js');
vi.mock('../../../utils/dice-utils.js');

describe('RollPerceptionSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new RollCommand([new RollPerceptionSubCommand()])]);

		// Mock Creature
		vi.mocked(Creature).mockImplementation(
			() =>
				({
					sheet: {
						staticInfo: { name: 'Test Character' },
					},
					statBonuses: {
						perception: 15,
					},
				}) as any
		);

		// Mock DiceUtils.buildDiceExpression
		vi.mocked(DiceUtils.buildDiceExpression).mockReturnValue('1d20+15');

		// Mock RollBuilder
		const mockAddRoll = vi.fn();
		const mockCompileEmbed = vi.fn(() => ({ data: { description: 'Perception roll result' } }));
		vi.mocked(RollBuilder).mockImplementation(
			() =>
				({
					addRoll: mockAddRoll,
					compileEmbed: mockCompileEmbed,
				}) as any
		);

		// Mock EmbedUtils.dispatchEmbeds
		vi.mocked(EmbedUtils.dispatchEmbeds).mockResolvedValue(undefined);
	});


	describe('successful perception rolls', () => {
		it('should roll a basic perception check', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll',
				subcommand: 'perception',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - check mock calls since EmbedUtils.dispatchEmbeds is mocked
			expect(RollBuilder).toHaveBeenCalled();
			expect(EmbedUtils.dispatchEmbeds).toHaveBeenCalled();
		});

		it('should roll perception with modifier', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll',
				subcommand: 'perception',
				options: {
					modifier: '+2',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(DiceUtils.buildDiceExpression).toHaveBeenCalledWith(
				'd20',
				expect.any(String),
				'+2'
			);
			expect(EmbedUtils.dispatchEmbeds).toHaveBeenCalled();
		});

		it('should roll perception with note', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll',
				subcommand: 'perception',
				options: {
					note: 'Looking for traps',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(RollBuilder).toHaveBeenCalledWith(
				expect.objectContaining({
					rollNote: 'Looking for traps',
				})
			);
			expect(EmbedUtils.dispatchEmbeds).toHaveBeenCalled();
		});

		it('should handle secret roll option', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll',
				subcommand: 'perception',
				options: {
					secret: 'secret',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(EmbedUtils.dispatchEmbeds).toHaveBeenCalledWith(
				expect.anything(),
				expect.anything(),
				'secret',
				undefined // gmUserId
			);
		});

		it('should use public roll by default', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll',
				subcommand: 'perception',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(EmbedUtils.dispatchEmbeds).toHaveBeenCalledWith(
				expect.anything(),
				expect.anything(),
				'public',
				undefined // gmUserId
			);
		});

		it('should roll perception with both modifier and note', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll',
				subcommand: 'perception',
				options: {
					modifier: '+4',
					note: 'Heightened awareness',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(DiceUtils.buildDiceExpression).toHaveBeenCalledWith(
				'd20',
				expect.any(String),
				'+4'
			);
			expect(RollBuilder).toHaveBeenCalledWith(
				expect.objectContaining({
					rollNote: 'Heightened awareness',
				})
			);
			expect(EmbedUtils.dispatchEmbeds).toHaveBeenCalled();
		});
	});
});
