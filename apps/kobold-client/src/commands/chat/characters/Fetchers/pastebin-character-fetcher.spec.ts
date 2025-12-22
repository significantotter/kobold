/**
 * Unit tests for PasteBinCharacterFetcher
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CommandInteraction, CacheType } from 'discord.js';
import { PasteBinCharacterFetcher } from './pastebin-character-fetcher.js';
import { PasteBin } from '../../../../services/pastebin/index.js';
import { SheetProperties } from '../../../../utils/sheet/sheet-properties.js';
import { type MockPasteBin } from '../../../../test-utils/mock-types.js';
import { getMockKobold, resetMockKobold } from '../../../../test-utils/index.js';
import type { Kobold } from '@kobold/db';

vi.mock('../../../../services/pastebin/index.js');

const createMockInteraction = () =>
	({
		user: { id: 'test-user-id' },
		userId: 'test-user-id',
		followUp: vi.fn(),
		editReply: vi.fn(),
	} as unknown as CommandInteraction<CacheType>);

describe('PasteBinCharacterFetcher', () => {
	const mockKobold = getMockKobold();
	let fetcher: PasteBinCharacterFetcher;
	let mockIntr: CommandInteraction<CacheType>;

	beforeEach(() => {
		resetMockKobold(mockKobold);
		mockIntr = createMockInteraction();
		fetcher = new PasteBinCharacterFetcher(
			mockIntr,
			mockKobold as unknown as Kobold,
			'test-user-id'
		);
	});

	describe('constructor', () => {
		it('should set importSource to pastebin', () => {
			expect(fetcher.importSource).toBe('pastebin');
		});
	});

	describe('fetchSourceData', () => {
		it('should fetch and return character data from PasteBin', async () => {
			const mockData = {
				sheet: SheetProperties.defaultSheet,
				modifiers: [],
				actions: [],
				rollMacros: [],
			};
			vi.mocked(PasteBin).mockImplementation(function (this: MockPasteBin) {
				this.get = vi.fn().mockResolvedValue(mockData);
				return this;
			} as unknown as () => PasteBin);

			const result = await fetcher.fetchSourceData({ url: 'testPasteKey' });

			expect(result).toEqual(mockData);
		});

		it('should use default sheet when sheet is not provided', async () => {
			const mockData = {
				modifiers: [{ name: 'Test Modifier' }],
				actions: [],
				rollMacros: [],
			};
			vi.mocked(PasteBin).mockImplementation(function (this: MockPasteBin) {
				this.get = vi.fn().mockResolvedValue(mockData);
				return this;
			} as unknown as () => PasteBin);

			const result = await fetcher.fetchSourceData({ url: 'testPasteKey' });

			expect(result.sheet).toEqual(SheetProperties.defaultSheet);
			// The modifiers array gets normalized with default values
			expect(result.modifiers).toHaveLength(1);
			expect(result.modifiers[0].name).toBe('Test Modifier');
		});

		it('should throw KoboldError when PasteBin request fails', async () => {
			vi.mocked(PasteBin).mockImplementation(function (this: MockPasteBin) {
				this.get = vi.fn().mockRejectedValue(new Error('Network error'));
				return this;
			} as unknown as () => PasteBin);

			await expect(fetcher.fetchSourceData({ url: 'badUrl' })).rejects.toThrow();
		});

		it('should throw KoboldError when data is invalid', async () => {
			vi.mocked(PasteBin).mockImplementation(function (this: MockPasteBin) {
				this.get = vi.fn().mockResolvedValue({
					sheet: 'invalid-not-an-object',
				});
				return this;
			} as unknown as () => PasteBin);

			await expect(fetcher.fetchSourceData({ url: 'invalidData' })).rejects.toThrow();
		});
	});

	describe('convertSheetRecord', () => {
		it('should convert PasteBin data to sheet record format', () => {
			const sourceData = {
				sheet: SheetProperties.defaultSheet,
				modifiers: [{ name: 'Modifier 1', isActive: true }] as any[],
				actions: [{ name: 'Action 1' }] as any[],
				rollMacros: [{ name: 'Macro 1' }] as any[],
			};
			const activeCharacter = {
				sheetRecord: {
					actions: [],
					modifiers: [],
					rollMacros: [],
				},
			} as any;

			const result = fetcher.convertSheetRecord(sourceData, activeCharacter);

			expect(result).toEqual({
				sheet: sourceData.sheet,
				actions: sourceData.actions,
				modifiers: sourceData.modifiers,
				rollMacros: sourceData.rollMacros,
			});
		});

		it('should work without activeCharacter', () => {
			const sourceData = {
				sheet: SheetProperties.defaultSheet,
				modifiers: [],
				actions: [],
				rollMacros: [],
			};

			const result = fetcher.convertSheetRecord(sourceData);

			expect(result).toEqual({
				sheet: sourceData.sheet,
				actions: [],
				modifiers: [],
				rollMacros: [],
			});
		});
	});

	describe('getCharId', () => {
		it('should return -1 (pastebin has no char id)', () => {
			expect(fetcher.getCharId({ url: 'anyUrl' })).toBe(-1);
		});
	});
});
