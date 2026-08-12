/**
 * Unit tests for ModifierToggleSubCommand
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	CharacterWithRelations,
	MinionWithRelations,
	Modifier,
	SheetAdjustmentTypeEnum,
} from '@kobold/db';
import { ModifierCommand } from './modifier-command.js';
import { ModifierToggleSubCommand } from './modifier-toggle-subcommand.js';
import {
	CommandTestHarness,
	createTestHarness,
	getFullEmbedContent,
	getMockKobold,
	resetMockKobold,
	TEST_GUILD_ID,
	TEST_USER_ID,
} from '../../../test-utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');

describe('ModifierToggleSubCommand', () => {
	const kobold = getMockKobold();
	const characterId = 10;
	const characterSheetRecordId = 100;
	const minionSheetRecordId = 200;

	let harness: CommandTestHarness;
	let triggerRecomputeMock: ReturnType<typeof vi.fn>;

	function createModifier(overrides: Partial<Modifier> = {}): Modifier {
		return {
			id: 1,
			sheetRecordId: characterSheetRecordId,
			userId: TEST_USER_ID,
			name: 'inspire courage',
			isActive: true,
			description: 'Bard inspiration',
			type: SheetAdjustmentTypeEnum.status,
			severity: null,
			sheetAdjustments: [],
			rollAdjustment: '+1',
			rollTargetTags: 'attack OR damage',
			note: null,
			...overrides,
		};
	}

	function createCharacter(modifiers: Modifier[] = []): CharacterWithRelations {
		return {
			id: characterId,
			name: 'Lilac Sootsnout',
			sheetRecordId: characterSheetRecordId,
			modifiers,
		} as CharacterWithRelations;
	}

	function createMinion(modifiers: Modifier[] = []): MinionWithRelations {
		return {
			id: 20,
			userId: TEST_USER_ID,
			characterId,
			name: 'Ember',
			sheetRecordId: minionSheetRecordId,
			modifiers,
		} as MinionWithRelations;
	}

	function setupKoboldUtils(activeCharacter: CharacterWithRelations | null): void {
		triggerRecomputeMock = vi.fn();
		const getActiveCharacterMock = vi.fn(async () => activeCharacter);
		const fetchNonNullableDataMock = vi.fn(async () => ({ activeCharacter }));

		vi.mocked(KoboldUtils).mockImplementation(function (this: any) {
			this.characterUtils = {
				getActiveCharacter: getActiveCharacterMock,
			};
			this.fetchNonNullableDataForCommand = fetchNonNullableDataMock;
			this.adjustedSheetService = {
				triggerRecompute: triggerRecomputeMock,
			};
			return this;
		} as any);
	}

	beforeEach(() => {
		resetMockKobold(kobold);
		harness = createTestHarness([new ModifierCommand([new ModifierToggleSubCommand()])]);
	});

	describe('successful modifier toggling', () => {
		it('toggles an active-character modifier when toggle-for is omitted', async () => {
			const modifier = createModifier();
			const activeCharacter = createCharacter([modifier]);
			setupKoboldUtils(activeCharacter);
			kobold.modifier.update.mockResolvedValue({ ...modifier, isActive: false });

			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'toggle',
				options: { name: modifier.name },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			expect(result.didRespond()).toBe(true);
			expect(kobold.modifier.update).toHaveBeenCalledWith(
				{ id: modifier.id },
				{ isActive: false }
			);
			expect(triggerRecomputeMock).toHaveBeenCalledWith(characterSheetRecordId);
			expect(getFullEmbedContent(result.interaction)).toContain(activeCharacter.name);
		});

		it('toggles an inactive minion modifier to active', async () => {
			const modifier = createModifier({
				id: 2,
				sheetRecordId: minionSheetRecordId,
				name: 'flanking bonus',
				isActive: false,
			});
			const activeCharacter = createCharacter();
			const minion = createMinion([modifier]);
			setupKoboldUtils(activeCharacter);
			kobold.minion.readMany.mockResolvedValue([minion]);
			kobold.modifier.update.mockResolvedValue({ ...modifier, isActive: true });

			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'toggle',
				options: {
					name: modifier.name,
					'toggle-for': `minion:${minionSheetRecordId}`,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			expect(kobold.minion.readMany).toHaveBeenCalledWith({ characterId });
			expect(kobold.modifier.update).toHaveBeenCalledWith(
				{ id: modifier.id },
				{ isActive: true }
			);
			expect(triggerRecomputeMock).toHaveBeenCalledWith(minionSheetRecordId);
			expect(getFullEmbedContent(result.interaction)).toContain(minion.name);
		});
	});

	describe('error handling', () => {
		it('does not update when the modifier is absent from the selected target', async () => {
			setupKoboldUtils(createCharacter());

			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'toggle',
				options: { name: 'nonexistent' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			expect(result.didRespond()).toBe(true);
			expect(kobold.modifier.update).not.toHaveBeenCalled();
			expect(triggerRecomputeMock).not.toHaveBeenCalled();
		});

		it('rejects a minion that is not assigned to the active character', async () => {
			setupKoboldUtils(createCharacter());
			kobold.minion.readMany.mockResolvedValue([]);

			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'toggle',
				options: {
					name: 'inspire courage',
					'toggle-for': 'minion:999',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			expect(result.didRespond()).toBe(true);
			expect(kobold.modifier.update).not.toHaveBeenCalled();
			expect(triggerRecomputeMock).not.toHaveBeenCalled();
		});
	});

	describe('autocomplete', () => {
		it('returns the active character and their assigned minions for toggle-for', async () => {
			const activeCharacter = createCharacter();
			const minion = createMinion();
			setupKoboldUtils(activeCharacter);
			kobold.minion.readManyLite.mockResolvedValue([minion]);

			const result = await harness.executeAutocomplete({
				commandName: 'modifier',
				subcommand: 'toggle',
				options: { 'toggle-for': '' },
				focusedOption: { name: 'toggle-for', value: '' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			expect(result.getChoices()).toEqual([
				{
					name: `🎭 ${activeCharacter.name} (active character)`,
					value: `character:${characterSheetRecordId}`,
				},
				{ name: `🐕 ${minion.name}`, value: `minion:${minionSheetRecordId}` },
			]);
			expect(kobold.minion.readManyLite).toHaveBeenCalledWith({ characterId });
		});

		it('returns matching modifiers for the selected minion', async () => {
			const modifier = createModifier({
				sheetRecordId: minionSheetRecordId,
				name: 'inspire courage',
			});
			setupKoboldUtils(createCharacter());
			kobold.minion.readMany.mockResolvedValue([createMinion([modifier])]);

			const result = await harness.executeAutocomplete({
				commandName: 'modifier',
				subcommand: 'toggle',
				options: {
					name: 'ins',
					'toggle-for': `minion:${minionSheetRecordId}`,
				},
				focusedOption: { name: 'name', value: 'ins' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			expect(result.getChoices()).toEqual([
				{ name: modifier.name, value: modifier.name },
			]);
		});

		it('returns matching active-character modifiers when toggle-for is omitted', async () => {
			const modifier = createModifier();
			setupKoboldUtils(createCharacter([modifier]));

			const result = await harness.executeAutocomplete({
				commandName: 'modifier',
				subcommand: 'toggle',
				options: { name: 'ins' },
				focusedOption: { name: 'name', value: 'ins' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			expect(result.getChoices()).toEqual([
				{ name: modifier.name, value: modifier.name },
			]);
			expect(kobold.minion.readMany).not.toHaveBeenCalled();
		});

		it('returns no choices when no character is active', async () => {
			setupKoboldUtils(null);

			const result = await harness.executeAutocomplete({
				commandName: 'modifier',
				subcommand: 'toggle',
				options: { name: 'test' },
				focusedOption: { name: 'name', value: 'test' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			expect(result.getChoices()).toEqual([]);
		});
	});
});
