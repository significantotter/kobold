import { CommandInteraction, CacheType } from 'discord.js';
import { PasteBinCharacterFetcher } from './pastebin-character-fetcher.js';
import { truncateDbForTests, vitestKobold } from '@kobold/db/test-utils';
import { Sheet } from '@kobold/db';
import { SheetProperties } from '../../../../utils/sheet/sheet-properties.js';
vitest.mock('pastebin-api');

const fakeIntr = { user: { id: 5 }, userId: 5 } as unknown as CommandInteraction<CacheType>;

describe('PasteBinCharacterFetcher', () => {
	let fetcher: PasteBinCharacterFetcher;

	beforeEach(() => {
		fetcher = new PasteBinCharacterFetcher(fakeIntr, vitestKobold, 'asdf');
	});

	afterEach(async () => {
		await truncateDbForTests();
		vitest.clearAllMocks();
	});

	describe('fetchSourceData', () => {
		it('should fetch source data', async () => {
			const mockData = {
				sheet: SheetProperties.defaultSheet,
				modifiers: [],
				actions: [],
				rollMacros: [],
			};
			vitest.mock('../../../../services/pastebin/index.js', () => ({
				PasteBin: vitest.fn(() => ({
					get: vitest.fn().mockResolvedValue({
						sheet: SheetProperties.defaultSheet,
						modifiers: [],
						actions: [],
						rollMacros: [],
					}),
				})),
			}));

			const result = await fetcher.fetchSourceData({ url: 'testUrl' });

			expect(result).toEqual(mockData);
		});
	});

	describe('convertSheetRecord', () => {
		it('should convert source data to a sheet record', () => {
			const sourceData = {
				sheet: {} as unknown as Sheet,
				modifiers: [],
				actions: [],
				rollMacros: [],
			};
			const activeCharacter = {
				sheetRecord: {
					actions: [],
					modifiers: [],
					rollMacros: [],
				},
			};

			const result = fetcher.convertSheetRecord(sourceData, activeCharacter as any);

			expect(result).toEqual({
				sheet: sourceData.sheet,
				actions: sourceData.actions,
				modifiers: sourceData.modifiers,
				rollMacros: sourceData.rollMacros,
			});
		});
	});

	describe('getCharId', () => {
		it('should return -1', () => {
			const result = fetcher.getCharId({ url: 'testUrl' });

			expect(result).toBe(-1);
		});
	});
});
