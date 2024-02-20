import { WgCharacterFetcher } from './wg-character-fetcher.js';
import {
	zWgCharacterApiResponseSchema,
	zWgCharacterCalculatedStatsApiResponseSchema,
} from '../../../../services/wanderers-guide/wanderers-guide.zod.js';
import { CommandInteraction, CacheType } from 'discord.js';
import { truncateDbForTests, vitestKobold } from 'kobold-db/test-utils';
import { generateMock } from '@anatine/zod-mock';
import { faker } from '@faker-js/faker';
const fakeIntr = { user: { id: 5 }, userId: 5 } as unknown as CommandInteraction<CacheType>;

describe('WgCharacterFetcher', () => {
	let fetcher: WgCharacterFetcher;

	beforeEach(() => {
		fetcher = new WgCharacterFetcher(fakeIntr, vitestKobold, 'asdf');
	});
	afterEach(async () => {
		await truncateDbForTests();
		vitest.clearAllMocks();
	});

	describe('fetchSourceData', () => {
		it('should fetch source data', async () => {
			const characterData = generateMock(zWgCharacterApiResponseSchema);
			const mockData = {
				characterData: generateMock(zWgCharacterApiResponseSchema),
				calculatedStats: generateMock(zWgCharacterCalculatedStatsApiResponseSchema),
			};
			await vitestKobold.wgAuthToken.create({
				charId: 12345,
				accessToken: 'foo',
				expiresAt: faker.date.future(),
				accessRights: 'bar',
				tokenType: 'baz',
			});
			fetcher.fetchWgCharacterFromToken = vitest.fn().mockResolvedValue(mockData);

			vitest.doMock('../../../../services/wanderers-guide/index.js', () => ({
				WanderersGuide: vitest.fn(() => ({
					get: vitest.fn().mockResolvedValue(characterData),
				})),
			}));

			const result = await fetcher.fetchSourceData({ charId: 12345 });

			expect(result).toEqual(mockData);
		});

		it('should handle axios errors', async () => {
			const error = new Error();
			fetcher.fetchWgCharacterFromToken = vitest.fn().mockRejectedValue(error);

			await expect(fetcher.fetchSourceData({ charId: 12345 })).rejects.toThrow();
		});
	});
	describe('fetchWgCharacterFromToken', () => {
		it('should fetch character data and calculated stats', async () => {
			vitest.mock('../../../../services/wanderers-guide/index.js', () => ({
				WanderersGuide: vitest.fn(
					({ apiKey, token }: { apiKey: string; token: string }) => {
						const mockCharacterData = generateMock(zWgCharacterApiResponseSchema);
						const mockCalculatedStats = generateMock(
							zWgCharacterCalculatedStatsApiResponseSchema
						);

						if (token)
							return {
								character: {
									get: vitest.fn().mockResolvedValue(mockCharacterData),
									getCalculatedStats: vitest
										.fn()
										.mockResolvedValue(mockCalculatedStats),
								},
							};
						if (apiKey)
							return {
								class: {
									get: vitest.fn().mockResolvedValue({
										class: { name: 'Class Name', keyAbility: 'Key Ability' },
									}),
								},
								ancestry: {
									get: vitest
										.fn()
										.mockResolvedValue({ ancestry: { name: 'Ancestry Name' } }),
								},
								heritage: {
									get: vitest
										.fn()
										.mockResolvedValue({ heritage: { name: 'Heritage Name' } }),
								},
								vHeritage: {
									get: vitest.fn().mockResolvedValue({
										vHeritage: { name: 'VHeritage Name' },
									}),
								},
								background: {
									get: vitest.fn().mockResolvedValue({
										background: { name: 'Background Name' },
									}),
								},
							};
					}
				),
			}));

			const result = await fetcher.fetchWgCharacterFromToken(12345, 'token');

			expect(zWgCharacterApiResponseSchema.safeParse(result.characterData)).toHaveProperty(
				'success',
				true
			);
			expect(
				zWgCharacterCalculatedStatsApiResponseSchema.safeParse(result.calculatedStats)
			).toHaveProperty('success', true);
		});
	});

	describe('convertSheetRecord', () => {
		it('should convert source data to a sheet record', () => {
			const characterData = generateMock(zWgCharacterApiResponseSchema);
			const sourceData = {
				characterData,
				calculatedStats: generateMock(zWgCharacterCalculatedStatsApiResponseSchema),
			};
			const result = fetcher.convertSheetRecord(sourceData);

			expect(result.sheet).toEqual(expect.any(Object));
			expect(result.actions).toEqual(expect.any(Array));
			expect(result.modifiers).toEqual(expect.any(Array));
			expect(result.rollMacros).toEqual(expect.any(Array));
		});
	});

	describe('getCharId', () => {
		it('should return the charId', () => {
			const result = fetcher.getCharId({ charId: 54321 });

			expect(result).toBe(54321);
		});
	});
});
