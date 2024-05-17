import { CommandInteraction, CacheType } from 'discord.js';
import { PathbuilderCharacterFetcher } from './pathbuilder-character-fetcher.js';
import { truncateDbForTests, vitestKobold } from '@kobold/db/test-utils';
import { zPathBuilderCharacterSchema } from '../../../../services/pathbuilder/pathbuilder.zod.js';
import { generateMock } from '@anatine/zod-mock';

const pbCharacterFactory = () => generateMock(zPathBuilderCharacterSchema);

const fakeIntr = { user: { id: 5 }, userId: 5 } as unknown as CommandInteraction<CacheType>;

describe('PathbuilderCharacterFetcher', () => {
	let fetcher: PathbuilderCharacterFetcher;

	beforeEach(() => {
		fetcher = new PathbuilderCharacterFetcher(fakeIntr, vitestKobold, 'asdf');
	});

	afterEach(async () => {
		await truncateDbForTests();
		vitest.clearAllMocks();
	});

	describe('fetchSourceData', () => {
		it('should fetch source data', async () => {
			const mockData = {};
			vitest.mock('../../../../services/pathbuilder/index.js', () => ({
				PathBuilder: vitest.fn(() => ({
					get: vitest.fn().mockResolvedValue({ success: true, build: {} }),
				})),
			}));

			const result = await fetcher.fetchSourceData({ jsonId: 12345 });

			expect(result).toEqual(mockData);
		});
	});

	describe('convertSheetRecord', () => {
		it('should convert source data to a sheet record', () => {
			const sourceData = pbCharacterFactory();
			const result = fetcher.convertSheetRecord(sourceData);

			expect(result.sheet.staticInfo.name).toEqual(sourceData.name);
		});
	});

	describe('getCharId', () => {
		it('should return -1', () => {
			const result = fetcher.getCharId({ jsonId: 54321 });

			expect(result).toBe(54321);
		});
	});
});
