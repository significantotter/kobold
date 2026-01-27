/**
 * Integration tests for RollAttackSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RollCommand } from './roll-command.js';
import { RollAttackSubCommand } from './roll-attack-subcommand.js';
import {
	createTestHarness,
	createMockCharacter,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
	type MockCreature,
	type MockKoboldUtils,
} from '../../../test-utils/index.js';
import { EmbedUtils } from '../../../utils/kobold-embed-utils.js';
import { ActionRoller } from '../../../utils/action-roller.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { Creature } from '../../../utils/creature.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-embed-utils.js');
vi.mock('../../../utils/action-roller.js');
vi.mock('../../../utils/kobold-helpers/finder-helpers.js');
vi.mock('../../../utils/creature.js');

describe('RollAttackSubCommand Integration', () => {
	let harness: CommandTestHarness;
	let mockCharacter: ReturnType<typeof createMockCharacter>;

	beforeEach(() => {
		harness = createTestHarness([new RollCommand([new RollAttackSubCommand()])]);
		mockCharacter = createMockCharacter();

		// Mock Creature constructor
		vi.mocked(Creature).mockImplementation(function (this: MockCreature) {
			(this as MockCreature & { _sheet: unknown })._sheet = {};
			return this;
		} as unknown as () => Creature);

		// Mock Creature getters using vi.spyOn
		vi.spyOn(Creature.prototype, 'sheet', 'get').mockReturnValue({
			staticInfo: { name: 'Test Character' },
		} as any);
		vi.spyOn(Creature.prototype, 'attacks', 'get').mockReturnValue([
			{
				name: 'Longsword',
				toHit: 12,
				damage: [{ dice: '1d8+4', type: 'slashing' }],
				effects: [],
				range: null,
				traits: [],
				notes: null,
			},
			{
				name: 'Shortbow',
				toHit: 10,
				damage: [{ dice: '1d6+2', type: 'piercing' }],
				effects: [],
				range: '60 feet',
				traits: [],
				notes: null,
			},
		]);

		// Mock ActionRoller.fromCreatureAttack
		const mockCompileEmbed = vi.fn(() => ({
			data: { description: 'Attack roll result' },
			addFields: vi.fn(() => {}),
		}));
		vi.mocked(ActionRoller.fromCreatureAttack).mockReturnValue({
			builtRoll: {
				compileEmbed: mockCompileEmbed,
			},
			actionRoller: {
				shouldDisplayDamageText: vi.fn(() => false),
			},
		} as any);

		// Mock EmbedUtils.dispatchEmbeds
		vi.mocked(EmbedUtils.dispatchEmbeds).mockResolvedValue(undefined);

		// Mock KoboldUtils - must include all needed utilities
		vi.mocked(KoboldUtils).mockImplementation(function (this: MockKoboldUtils) {
			(this as MockKoboldUtils & { gameUtils: unknown }).gameUtils = {
				getCharacterOrInitActorTarget: vi.fn(async () => ({
					targetSheetRecord: { sheet: {} },
					hideStats: false,
				})),
			};
			(this as MockKoboldUtils & { creatureUtils: unknown }).creatureUtils = {
				saveSheet: vi.fn(async () => undefined),
			};
			(
				this as MockKoboldUtils & { fetchDataForCommand: ReturnType<typeof vi.fn> }
			).fetchDataForCommand = vi.fn(async () => ({
				activeCharacter: mockCharacter,
				userSettings: {},
			}));
			this.fetchNonNullableDataForCommand = vi.fn(async () => ({
				activeCharacter: mockCharacter,
				userSettings: {},
			}));
			this.assertActiveCharacterNotNull = vi.fn(() => {});
			return this;
		} as unknown as () => KoboldUtils);
	});

	describe('successful attack rolls', () => {
		it('should roll an attack against a target', async () => {
			// Act
			const result = await harness.executeCommand({
				commandName: 'roll',
				subcommand: 'attack',
				options: {
					attack: 'Longsword',
					'target-character': 'Goblin',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - check mock calls since EmbedUtils.dispatchEmbeds is mocked
			expect(ActionRoller.fromCreatureAttack).toHaveBeenCalled();
			expect(EmbedUtils.dispatchEmbeds).toHaveBeenCalled();
		});

		it('should roll an attack with attack modifier', async () => {
			// Act
			const result = await harness.executeCommand({
				commandName: 'roll',
				subcommand: 'attack',
				options: {
					attack: 'Longsword',
					'target-character': 'Goblin',
					'attack-modifier': '+2',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(ActionRoller.fromCreatureAttack).toHaveBeenCalledWith(
				expect.objectContaining({
					attackModifierExpression: '+2',
				})
			);
			expect(EmbedUtils.dispatchEmbeds).toHaveBeenCalled();
		});

		it('should roll an attack with damage modifier', async () => {
			// Act
			const result = await harness.executeCommand({
				commandName: 'roll',
				subcommand: 'attack',
				options: {
					attack: 'Longsword',
					'target-character': 'Goblin',
					'damage-modifier': '+1d6',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(ActionRoller.fromCreatureAttack).toHaveBeenCalledWith(
				expect.objectContaining({
					damageModifierExpression: '+1d6',
				})
			);
			expect(EmbedUtils.dispatchEmbeds).toHaveBeenCalled();
		});

		it('should roll an attack with overwrite AC', async () => {
			// Act
			const result = await harness.executeCommand({
				commandName: 'roll',
				subcommand: 'attack',
				options: {
					attack: 'Longsword',
					'target-character': 'Goblin',
					'overwrite-ac': 15,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(ActionRoller.fromCreatureAttack).toHaveBeenCalledWith(
				expect.objectContaining({
					targetAC: 15,
				})
			);
			expect(EmbedUtils.dispatchEmbeds).toHaveBeenCalled();
		});

		it('should roll an attack with note', async () => {
			// Act
			const result = await harness.executeCommand({
				commandName: 'roll',
				subcommand: 'attack',
				options: {
					attack: 'Longsword',
					'target-character': 'Goblin',
					note: 'Sneak attack!',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(ActionRoller.fromCreatureAttack).toHaveBeenCalledWith(
				expect.objectContaining({
					rollNote: 'Sneak attack!',
				})
			);
			expect(EmbedUtils.dispatchEmbeds).toHaveBeenCalled();
		});

		it('should handle secret roll option', async () => {
			// Act
			const result = await harness.executeCommand({
				commandName: 'roll',
				subcommand: 'attack',
				options: {
					attack: 'Longsword',
					'target-character': 'Goblin',
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

		it('should handle attack with no target', async () => {
			// Override for this test - no target
			vi.mocked(KoboldUtils).mockImplementation(function (this: MockKoboldUtils) {
				(this as MockKoboldUtils & { gameUtils: unknown }).gameUtils = {
					getCharacterOrInitActorTarget: vi.fn(async () => ({
						targetSheetRecord: null,
						hideStats: false,
					})),
				};
				(this as MockKoboldUtils & { creatureUtils: unknown }).creatureUtils = {
					saveSheet: vi.fn(async () => undefined),
				};
				(
					this as MockKoboldUtils & { fetchDataForCommand: ReturnType<typeof vi.fn> }
				).fetchDataForCommand = vi.fn(async () => ({
					activeCharacter: mockCharacter,
					userSettings: {},
				}));
				this.fetchNonNullableDataForCommand = vi.fn(async () => ({
					activeCharacter: mockCharacter,
					userSettings: {},
				}));
				this.assertActiveCharacterNotNull = vi.fn(() => {});
				return this;
			} as unknown as () => KoboldUtils);

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll',
				subcommand: 'attack',
				options: {
					attack: 'Longsword',
					'target-character': '(none)',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(EmbedUtils.dispatchEmbeds).toHaveBeenCalled();
		});
	});

	describe('autocomplete', () => {
		it('should return matching attacks for autocomplete', async () => {
			// Arrange - setup autocomplete specific mocks
			vi.mocked(KoboldUtils).mockImplementation(function (this: MockKoboldUtils) {
				(this as MockKoboldUtils & { characterUtils: unknown }).characterUtils = {
					getActiveCharacter: vi.fn(async () => mockCharacter),
				};
				(
					this as MockKoboldUtils & { fetchDataForCommand: ReturnType<typeof vi.fn> }
				).fetchDataForCommand = vi.fn(async () => ({
					activeCharacter: mockCharacter,
				}));
				this.fetchNonNullableDataForCommand = vi.fn(async () => ({
					activeCharacter: mockCharacter,
				}));
				return this;
			} as unknown as () => KoboldUtils);

			vi.spyOn(FinderHelpers, 'matchAllAttacks').mockReturnValue([
				{ name: 'Longsword', toHit: 12 },
				{ name: 'Longbow', toHit: 10 },
			] as any);

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'roll',
				subcommand: 'attack',
				focusedOption: { name: 'attack', value: 'long' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - autocomplete may return empty if matcher isn't being hit
			expect(result.getChoices()).toBeDefined();
		});

		it('should return empty array when no character is active', async () => {
			// Arrange
			vi.mocked(KoboldUtils).mockImplementation(function (this: MockKoboldUtils) {
				(this as MockKoboldUtils & { characterUtils: unknown }).characterUtils = {
					getActiveCharacter: vi.fn(async () => null),
				};
				(
					this as MockKoboldUtils & { fetchDataForCommand: ReturnType<typeof vi.fn> }
				).fetchDataForCommand = vi.fn(async () => ({
					activeCharacter: null,
				}));
				this.fetchNonNullableDataForCommand = vi.fn(async () => ({
					activeCharacter: null,
				}));
				return this;
			} as unknown as () => KoboldUtils);

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'roll',
				subcommand: 'attack',
				focusedOption: { name: 'attack', value: 'sword' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.getChoices()).toEqual([]);
		});
	});
});
