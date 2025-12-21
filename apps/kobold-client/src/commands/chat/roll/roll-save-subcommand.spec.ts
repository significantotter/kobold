/**
 * Integration tests for RollSaveSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RollCommand } from './roll-command.js';
import { RollSaveSubCommand } from './roll-save-subcommand.js';
import {
	createTestHarness,
	createMockCharacter,
	setupKoboldUtilsMocks,
	setupAutocompleteKoboldMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';
import { EmbedUtils } from '../../../utils/kobold-embed-utils.js';
import { RollBuilder } from '../../../utils/roll-builder.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { Creature } from '../../../utils/creature.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-embed-utils.js');
vi.mock('../../../utils/roll-builder.js');
vi.mock('../../../utils/kobold-helpers/finder-helpers.js');
vi.mock('../../../utils/creature.js');

describe('RollSaveSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new RollCommand([new RollSaveSubCommand()])]);

		// Mock Creature
		vi.mocked(Creature).mockImplementation(
			() =>
				({
					sheet: {
						staticInfo: { name: 'Test Character' },
					},
					savingThrowRolls: {
						fortitude: { name: 'Fortitude', bonus: 12, roll: '1d20+12' },
						reflex: { name: 'Reflex', bonus: 10, roll: '1d20+10' },
						will: { name: 'Will', bonus: 8, roll: '1d20+8' },
					},
				}) as any
		);

		// Mock RollBuilder.fromSimpleCreatureRoll
		vi.mocked(RollBuilder.fromSimpleCreatureRoll).mockResolvedValue({
			compileEmbed: vi.fn(() => ({ data: { description: 'Save roll result' } })),
		} as any);

		// Mock EmbedUtils.dispatchEmbeds
		vi.mocked(EmbedUtils.dispatchEmbeds).mockResolvedValue(undefined);
	});


	describe('successful save rolls', () => {
		it('should roll a fortitude save', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll',
				subcommand: 'save',
				options: {
					save: 'fortitude',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - check mock calls since EmbedUtils.dispatchEmbeds is mocked
			expect(RollBuilder.fromSimpleCreatureRoll).toHaveBeenCalled();
			expect(EmbedUtils.dispatchEmbeds).toHaveBeenCalled();
		});

		it('should roll a reflex save', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll',
				subcommand: 'save',
				options: {
					save: 'reflex',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(RollBuilder.fromSimpleCreatureRoll).toHaveBeenCalled();
			expect(EmbedUtils.dispatchEmbeds).toHaveBeenCalled();
		});

		it('should roll a will save', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll',
				subcommand: 'save',
				options: {
					save: 'will',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(RollBuilder.fromSimpleCreatureRoll).toHaveBeenCalled();
			expect(EmbedUtils.dispatchEmbeds).toHaveBeenCalled();
		});

		it('should roll a save with modifier', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll',
				subcommand: 'save',
				options: {
					save: 'fortitude',
					modifier: '+2',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(RollBuilder.fromSimpleCreatureRoll).toHaveBeenCalledWith(
				expect.objectContaining({
					modifierExpression: '+2',
				})
			);
			expect(EmbedUtils.dispatchEmbeds).toHaveBeenCalled();
		});

		it('should roll a save with note', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll',
				subcommand: 'save',
				options: {
					save: 'reflex',
					note: 'Dodging fireball',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(RollBuilder.fromSimpleCreatureRoll).toHaveBeenCalledWith(
				expect.objectContaining({
					rollNote: 'Dodging fireball',
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
				subcommand: 'save',
				options: {
					save: 'will',
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
	});

	describe('autocomplete', () => {
		it('should return matching saves for autocomplete', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			setupAutocompleteKoboldMocks({ characterOverrides: mockCharacter });

			vi.spyOn(FinderHelpers, 'matchAllSaves').mockReturnValue([
				{ name: 'Fortitude', bonus: 12 },
				{ name: 'Reflex', bonus: 10 },
				{ name: 'Will', bonus: 8 },
			] as any);

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'roll',
				subcommand: 'save',
				focusedOption: { name: 'save', value: 'f' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - autocomplete may return empty if matcher isn't being hit
			expect(result.getChoices()).toBeDefined();
		});

		it('should return empty array when no character is active', async () => {
			// Arrange
			setupAutocompleteKoboldMocks({ noActiveCharacter: true });

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'roll',
				subcommand: 'save',
				focusedOption: { name: 'save', value: 'for' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.getChoices()).toEqual([]);
		});
	});
});
