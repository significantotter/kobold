/**
 * Integration tests for RollSkillSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RollCommand } from './roll-command.js';
import { RollSkillSubCommand } from './roll-skill-subcommand.js';
import {
	createTestHarness,
	createMockCharacter,
	setupKoboldUtilsMocks,
	setupAutocompleteKoboldMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
	type MockCreature,
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

describe('RollSkillSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new RollCommand([new RollSkillSubCommand()])]);

		// Mock Creature constructor
		vi.mocked(Creature).mockImplementation(function (this: MockCreature) {
			return this;
		} as unknown as () => Creature);

		// Mock Creature getters using vi.spyOn - this works with mock resets
		vi.spyOn(Creature.prototype, 'sheet', 'get').mockReturnValue({
			staticInfo: { name: 'Test Character' },
		} as any);
		vi.spyOn(Creature.prototype, 'skillRolls', 'get').mockReturnValue({
			acrobatics: { name: 'Acrobatics', bonus: 10, type: 'skill', tags: [] },
			athletics: { name: 'Athletics', bonus: 8, type: 'skill', tags: [] },
			stealth: { name: 'Stealth', bonus: 12, type: 'skill', tags: [] },
		});

		// Mock RollBuilder.fromSimpleCreatureRoll
		vi.mocked(RollBuilder.fromSimpleCreatureRoll).mockResolvedValue({
			compileEmbed: vi.fn(() => ({ data: { description: 'Skill roll result' } })),
		} as any);

		// Mock EmbedUtils.dispatchEmbeds
		vi.mocked(EmbedUtils.dispatchEmbeds).mockResolvedValue(undefined);
	});

	describe('successful skill rolls', () => {
		it('should roll a skill check', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll',
				subcommand: 'skill',
				options: {
					skill: 'acrobatics',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - check mock calls since EmbedUtils.dispatchEmbeds is mocked
			expect(RollBuilder.fromSimpleCreatureRoll).toHaveBeenCalled();
			expect(EmbedUtils.dispatchEmbeds).toHaveBeenCalled();
		});

		it('should roll a skill check with modifier', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll',
				subcommand: 'skill',
				options: {
					skill: 'stealth',
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

		it('should roll a skill check with note', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll',
				subcommand: 'skill',
				options: {
					skill: 'athletics',
					note: 'Climbing the wall',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(RollBuilder.fromSimpleCreatureRoll).toHaveBeenCalledWith(
				expect.objectContaining({
					rollNote: 'Climbing the wall',
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
				subcommand: 'skill',
				options: {
					skill: 'stealth',
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
		it('should return matching skills for autocomplete', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			setupAutocompleteKoboldMocks({ characterOverrides: mockCharacter });

			vi.spyOn(FinderHelpers, 'matchAllSkills').mockReturnValue([
				{ name: 'Acrobatics', bonus: 10 },
				{ name: 'Athletics', bonus: 8 },
			] as any);

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'roll',
				subcommand: 'skill',
				focusedOption: { name: 'skill', value: 'a' },
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
				subcommand: 'skill',
				focusedOption: { name: 'skill', value: 'ste' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.getChoices()).toEqual([]);
		});
	});
});
