/**
 * Unit tests for WgCharacterFetcher
 */
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { CommandInteraction, CacheType } from 'discord.js';
import { WgCharacterFetcher } from './wg-character-fetcher.js';
import { WanderersGuide } from '../../../../services/wanderers-guide/index.js';
import { Creature } from '../../../../utils/creature.js';
import { getMockKobold, resetMockKobold } from '../../../../test-utils/index.js';
import type { Kobold } from '@kobold/db';

vi.mock('../../../../services/wanderers-guide/index.js');
vi.mock('../../../../utils/creature.js');

const createMockInteraction = () =>
	({
		user: { id: 'test-user-id' },
		userId: 'test-user-id',
		followUp: vi.fn(),
		editReply: vi.fn(),
		reply: vi.fn(),
		deferred: false,
		replied: false,
	} as unknown as CommandInteraction<CacheType>);

const createMockCharacterData = () => ({
	id: 123,
	name: 'Test Character',
	level: 5,
	classID: 1,
	classID_2: null,
	ancestryID: 2,
	heritageID: 3,
	uniHeritageID: null,
	backgroundID: 4,
	createdAt: '2023-01-01',
	updatedAt: '2023-01-02',
});

const createMockCalculatedStats = () => ({
	charID: 123,
	maxHP: 50,
	maxResolve: null,
	maxStamina: null,
	conditions: [],
	totalClassDC: 20,
	totalSpeed: 25,
	totalAC: 18,
	totalPerception: 10,
	generalInfo: {
		className: 'Fighter',
		heritageAncestryName: 'Human',
		backgroundName: 'Soldier',
		size: 'Medium',
		traits: ['Human', 'Humanoid'],
	},
	totalSkills: [],
	totalSaves: [],
	totalAbilityScores: [],
	weapons: [],
	createdAt: '2023-01-01',
	updatedAt: '2023-01-02',
});

describe('WgCharacterFetcher', () => {
	const mockKobold = getMockKobold();
	let fetcher: WgCharacterFetcher;
	let mockIntr: CommandInteraction<CacheType>;

	beforeEach(() => {
		resetMockKobold(mockKobold);
		mockIntr = createMockInteraction();
		fetcher = new WgCharacterFetcher(mockIntr, mockKobold as unknown as Kobold, 'test-user-id');
		vi.clearAllMocks();
	});

	describe('constructor', () => {
		it('should set importSource to wg', () => {
			expect(fetcher.importSource).toBe('wg');
		});
	});

	describe('fetchDuplicateCharacter', () => {
		it('should return null when no duplicate exists', async () => {
			(mockKobold.character.read as Mock).mockResolvedValue(null);

			const result = await fetcher.fetchDuplicateCharacter({ charId: 123 }, {
				sheet: { staticInfo: { name: 'Test Character' } },
			} as any);

			expect(result).toBeNull();
		});

		it('should return character when duplicate by charId exists', async () => {
			const existingCharacter = { id: 'existing-id', charId: 123 };
			(mockKobold.character.read as Mock)
				.mockResolvedValueOnce(existingCharacter) // by charId
				.mockResolvedValueOnce(null); // by name

			const result = await fetcher.fetchDuplicateCharacter({ charId: 123 }, {
				sheet: { staticInfo: { name: 'Different Name' } },
			} as any);

			expect(result).toEqual(existingCharacter);
		});

		it('should return character when duplicate by name exists', async () => {
			const existingCharacter = { id: 'existing-id', name: 'Test Character' };
			(mockKobold.character.read as Mock)
				.mockResolvedValueOnce(null) // by charId
				.mockResolvedValueOnce(existingCharacter); // by name

			const result = await fetcher.fetchDuplicateCharacter({ charId: 456 }, {
				sheet: { staticInfo: { name: 'Test Character' } },
			} as any);

			expect(result).toEqual(existingCharacter);
		});
	});

	describe('fetchSourceData', () => {
		it('should throw KoboldError when no token exists', async () => {
			(mockKobold.wgAuthToken.read as Mock).mockResolvedValue(null);

			await expect(fetcher.fetchSourceData({ charId: 123 })).rejects.toThrow();
		});

		// This test is skipped because WanderersGuide uses getters that are difficult to mock properly.
		// The integration test (wg-character-fetcher.integration.spec.ts) covers this functionality.
		it.skip('should fetch character data when valid token exists', async () => {
			// Complex mocking of WanderersGuide with its getter-based APIs
			// is better tested in integration tests
		});
	});

	describe('convertSheetRecord', () => {
		it('should convert WG data to sheet record using Creature', () => {
			const mockCharData = createMockCharacterData();
			const mockCalcStats = createMockCalculatedStats();
			const mockSheet = { staticInfo: { name: 'Test' } };
			const mockActions = [{ name: 'Strike' }];
			const mockModifiers = [{ name: 'Bonus' }];
			const mockRollMacros = [{ name: 'Attack' }];

			vi.mocked(Creature.fromWandererersGuide).mockReturnValue({
				_sheet: mockSheet,
				actions: mockActions,
				modifiers: mockModifiers,
				rollMacros: mockRollMacros,
			} as any);

			const result = fetcher.convertSheetRecord({
				characterData: mockCharData as any,
				calculatedStats: mockCalcStats as any,
			});

			expect(Creature.fromWandererersGuide).toHaveBeenCalledWith(
				mockCalcStats,
				mockCharData,
				undefined
			);
			expect(result).toEqual({
				sheet: mockSheet,
				actions: mockActions,
				modifiers: mockModifiers,
				rollMacros: mockRollMacros,
			});
		});

		it('should pass activeCharacter sheetRecord when provided', () => {
			const mockCharData = createMockCharacterData();
			const mockCalcStats = createMockCalculatedStats();
			const activeCharacter = {
				sheetRecord: {
					sheet: { staticInfo: { name: 'Existing' } },
					actions: [],
					modifiers: [],
					rollMacros: [],
				},
			} as any;

			vi.mocked(Creature.fromWandererersGuide).mockReturnValue({
				_sheet: {},
				actions: [],
				modifiers: [],
				rollMacros: [],
			} as any);

			fetcher.convertSheetRecord(
				{
					characterData: mockCharData as any,
					calculatedStats: mockCalcStats as any,
				},
				activeCharacter
			);

			expect(Creature.fromWandererersGuide).toHaveBeenCalledWith(
				mockCalcStats,
				mockCharData,
				activeCharacter.sheetRecord
			);
		});
	});

	describe('getCharId', () => {
		it('should return the charId from args', () => {
			expect(fetcher.getCharId({ charId: 12345 })).toBe(12345);
		});
	});

	describe('requestAccessToken', () => {
		it('should throw KoboldError with authentication link', () => {
			expect(() => fetcher.requestAccessToken(123)).toThrow();
		});

		it('should reply when interaction not deferred', () => {
			expect(() => fetcher.requestAccessToken(123)).toThrow();
			expect(mockIntr.reply).toHaveBeenCalled();
		});

		it('should followUp when interaction already replied', () => {
			(mockIntr as any).replied = true;
			expect(() => fetcher.requestAccessToken(123)).toThrow();
			expect(mockIntr.followUp).toHaveBeenCalled();
		});
	});
});
