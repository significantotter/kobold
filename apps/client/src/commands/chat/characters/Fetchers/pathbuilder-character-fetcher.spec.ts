/**
 * Unit tests for PathbuilderCharacterFetcher
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CommandInteraction, CacheType } from 'discord.js';
import { PathbuilderCharacterFetcher } from './pathbuilder-character-fetcher.js';
import { PathBuilder } from '@kobold/schema';
import { fetchNethysItemMetadataForPathbuilder } from '@kobold/sheet';
import { Creature } from '../../../../utils/creature.js';
import { getMockKobold, resetMockKobold } from '../../../../test-utils/index.js';
import type { Kobold } from '@kobold/db';

vi.mock('../../../../utils/creature.js');
vi.mock('@kobold/sheet', () => ({
	fetchNethysItemMetadataForPathbuilder: vi.fn().mockResolvedValue([]),
}));

const createMockPathbuilderCharacter = (): PathBuilder.Character => ({
	name: 'Test Character',
	class: 'Fighter',
	level: 1,
	ancestry: 'Human',
	heritage: 'Skilled Human',
	background: 'Warrior',
	size: 2,
	keyability: 'str',
	languages: ['Common'],
	attributes: {
		ancestryhp: 8,
		classhp: 10,
		bonushp: 0,
		bonushpPerLevel: 0,
		speed: 25,
		speedBonus: 0,
	},
	abilities: {
		str: 18,
		dex: 12,
		con: 14,
		int: 10,
		wis: 10,
		cha: 10,
		breakdown: {
			ancestryFree: [],
			ancestryBoosts: ['Str', 'Con'],
			ancestryFlaws: [],
			backgroundBoosts: ['Str', 'Dex'],
			classBoosts: ['Str'],
			mapLevelledBoosts: {},
		},
	},
	proficiencies: {
		classDC: 2,
		perception: 2,
		fortitude: 4,
		reflex: 2,
		will: 2,
		unarmored: 2,
		simple: 2,
		martial: 2,
		unarmed: 2,
		athletics: 2,
	},
	mods: {},
	specificProficiencies: {
		trained: [],
		expert: [],
		master: [],
		legendary: [],
	},
	weapons: [],
	money: {},
	armor: [],
	focusPoints: 0,
	focus: {},
	spellCasters: [],
	formula: [],
	pets: [],
	acTotal: {
		acProfBonus: 2,
		acAbilityBonus: 1,
		acItemBonus: 0,
		acTotal: 13,
		shieldBonus: null,
	},
});

const createMockInteraction = () =>
	({
		user: { id: 'test-user-id' },
		userId: 'test-user-id',
		followUp: vi.fn(),
		editReply: vi.fn(),
	}) as unknown as CommandInteraction<CacheType>;

describe('PathbuilderCharacterFetcher', () => {
	const mockKobold = getMockKobold();
	let fetcher: PathbuilderCharacterFetcher;
	let mockIntr: CommandInteraction<CacheType>;

	beforeEach(() => {
		vi.clearAllMocks();
		resetMockKobold(mockKobold);
		mockIntr = createMockInteraction();
		fetcher = new PathbuilderCharacterFetcher(
			mockIntr,
			mockKobold as unknown as Kobold,
			'test-user-id'
		);
	});

	describe('constructor', () => {
		it('should set importSource to pathbuilder', () => {
			expect(fetcher.importSource).toBe('pathbuilder');
		});

		it('should default useStamina to false', () => {
			expect(fetcher.options.useStamina).toBe(false);
		});

		it('should accept useStamina option', () => {
			const fetcherWithStamina = new PathbuilderCharacterFetcher(
				mockIntr,
				mockKobold as unknown as Kobold,
				'test-user-id',
				{ useStamina: true }
			);
			expect(fetcherWithStamina.options.useStamina).toBe(true);
		});
	});

	describe('fetchSourceData', () => {
		it('should fetch and return character data from PathBuilder', async () => {
			const mockBuild = createMockPathbuilderCharacter();
			vi.spyOn(PathBuilder.prototype, 'get').mockResolvedValue({
				success: true,
				build: mockBuild,
			});

			const result = await fetcher.fetchSourceData({ jsonId: 12345 });

			expect(result).toEqual(mockBuild);
			expect(fetchNethysItemMetadataForPathbuilder).toHaveBeenCalledWith(mockBuild);
		});

		it('should throw KoboldError when PathBuilder request fails', async () => {
			vi.spyOn(PathBuilder.prototype, 'get').mockResolvedValue({
				success: false,
			} as Awaited<ReturnType<PathBuilder['get']>>);

			await expect(fetcher.fetchSourceData({ jsonId: 12345 })).rejects.toThrow();
		});
	});

	describe('convertSheetRecord', () => {
		it('should convert PathBuilder data to sheet record format', () => {
			const mockSourceData = createMockPathbuilderCharacter();
			const mockSheet = { staticInfo: { name: mockSourceData.name } };
			const mockActions = [
				{
					name: 'Test Action',
					description: 'A test action',
					type: 'attack',
					actionCost: 'oneAction',
					baseLevel: 1,
					autoHeighten: false,
					rolls: [],
					tags: [],
				},
			];
			const mockModifiers = [
				{
					name: 'Test Modifier',
					description: 'A test modifier',
					type: 'untyped',
					isActive: true,
					note: null,
					rollAdjustment: null,
					rollTargetTags: null,
					severity: null,
					sheetAdjustments: null,
				},
			];
			const mockRollMacros = [{ name: 'Test Macro', macro: '1d20' }];

			vi.mocked(Creature.fromPathBuilder).mockReturnValue({
				_sheet: mockSheet,
				actions: mockActions,
				modifiers: mockModifiers,
				rollMacros: mockRollMacros,
			} as unknown as Creature);

			const result = fetcher.convertSheetRecord(mockSourceData);

			expect(result).toEqual({
				sheetRecord: {
					sheet: mockSheet,
				},
				actions: mockActions,
				modifiers: mockModifiers,
				rollMacros: mockRollMacros,
			});
			expect(Creature.fromPathBuilder).toHaveBeenCalledWith(mockSourceData, undefined, {
				useStamina: false,
				nethysCompendiumEntries: [],
			});
		});

		it('should pass useStamina option to Creature.fromPathBuilder', () => {
			const fetcherWithStamina = new PathbuilderCharacterFetcher(
				mockIntr,
				mockKobold as unknown as Kobold,
				'test-user-id',
				{ useStamina: true }
			);
			const mockSourceData = createMockPathbuilderCharacter();

			vi.mocked(Creature.fromPathBuilder).mockReturnValue({
				_sheet: {},
				actions: [],
				modifiers: [],
				rollMacros: [],
			} as unknown as Creature);

			fetcherWithStamina.convertSheetRecord(mockSourceData);

			expect(Creature.fromPathBuilder).toHaveBeenCalledWith(mockSourceData, undefined, {
				useStamina: true,
				nethysCompendiumEntries: [],
			});
		});

		it('should pass active character when updating', () => {
			const mockSourceData = createMockPathbuilderCharacter();
			const mockActiveCharacter = {
				sheetRecord: { id: 'sheet-123' },
				actions: [],
				modifiers: [],
				rollMacros: [],
			} as any;

			vi.mocked(Creature.fromPathBuilder).mockReturnValue({
				_sheet: {},
				actions: [],
				modifiers: [],
				rollMacros: [],
			} as unknown as Creature);

			fetcher.convertSheetRecord(mockSourceData, mockActiveCharacter);

			expect(Creature.fromPathBuilder).toHaveBeenCalledWith(
				mockSourceData,
				mockActiveCharacter,
				{ useStamina: false, nethysCompendiumEntries: [] }
			);
		});
	});

	describe('getCharId', () => {
		it('should return the jsonId from args', () => {
			expect(fetcher.getCharId({ jsonId: 54321 })).toBe(54321);
		});
	});
});
