import { CommandInteraction, CacheType } from 'discord.js';
import { NewSheetRecord } from '../../../../services/kobold/index.js';
import { CharacterFetcher } from './character-fetcher.js';

const fakeIntr = { user: { id: 5 }, userId: 5 } as unknown as CommandInteraction<CacheType>;

class MockCharacterFetcher extends CharacterFetcher<any, any> {
	importSource = 'test';
	fetchSourceData() {
		return Promise.resolve({});
	}
	convertSheetRecord() {
		return { sheet: { staticInfo: { name: 'test' } } } as unknown as NewSheetRecord;
	}
	getCharId() {
		return 1;
	}
}

describe('CharacterFetcher', () => {
	let fetcher: MockCharacterFetcher;
	let mockKobold: any;

	beforeEach(() => {
		mockKobold = {
			character: {
				read: vitest.fn().mockResolvedValue(null),
				readActive: vitest.fn().mockResolvedValue({
					id: 'activeCharId',
					name: 'oldName',
					sheetRecordId: 'sheetRecordId',
					sheetRecord: { sheet: { staticInfo: { name: 'oldName' } } },
				}),
				create: vitest.fn().mockResolvedValue({ name: 'test' }),
			},
			sheetRecord: {
				create: vitest
					.fn()
					.mockResolvedValue({ id: 1, sheet: { staticInfo: { name: 'test' } } }),
			},
		};
		fetcher = new MockCharacterFetcher(fakeIntr, mockKobold, 'testUserId');
	});
	afterEach(() => {
		vitest.clearAllMocks();
	});

	describe('create', () => {
		it('should create a new character', async () => {
			const character = await fetcher.create({});
			expect(character.name).toBe('test');
			expect(mockKobold.character.read).toHaveBeenCalledWith({
				name: 'test',
				userId: 'testUserId',
			});
			expect(mockKobold.sheetRecord.create).toHaveBeenCalledWith({
				sheet: { staticInfo: { name: 'test' } },
			});
			expect(mockKobold.character.create).toHaveBeenCalledWith({
				name: 'test',
				userId: 'testUserId',
				sheetRecordId: 1,
				importSource: 'test',
				charId: 1,
			});
		});
	});
	describe('update', () => {
		it('should update a character', async () => {
			const mockKoboldUtils = {
				characterUtils: {
					getActiveCharacter: vitest.fn().mockResolvedValue({
						id: 'activeCharId',
						name: 'oldName',
						sheetRecordId: 'sheetRecordId',
						sheetRecord: { sheet: { staticInfo: { name: 'oldName' } } },
					}),
				},
				assertActiveCharacterNotNull: vitest.fn(),
			};
			const sourceData = { name: 'test' };
			const args = {};

			fetcher.fetchSourceData = vitest.fn().mockResolvedValue(sourceData);
			fetcher.confirmUpdateName = vitest.fn();
			mockKobold.character.update = vitest.fn().mockResolvedValue({ name: 'test' });
			mockKobold.sheetRecord.update = vitest.fn().mockResolvedValue({
				id: 'sheetRecordId',
				sheet: { staticInfo: { name: 'test' } },
			});

			vitest.mock('../../../../utils/collector-utils.js', () => {
				return {
					CollectorUtils: {
						collectByButton: vitest.fn().mockResolvedValue({ value: 'update' }),
					},
				};
			});

			const updatedCharacter = await fetcher.update(args);

			expect(fetcher.fetchSourceData).toHaveBeenCalledWith(args);
			expect(fetcher.confirmUpdateName).toHaveBeenCalledWith('oldName', 'test');
			expect(mockKobold.character.readActive).toHaveBeenCalledWith({
				userId: 5,
				channelId: undefined,
				guildId: undefined,
			});
			expect(mockKobold.sheetRecord.update).toHaveBeenCalledWith(
				{ id: 'sheetRecordId' },
				{ sheet: { staticInfo: { name: 'test' } } }
			);
			expect(mockKobold.character.update).toHaveBeenCalledWith(
				{ id: 'activeCharId' },
				{ name: 'test' }
			);
			expect(updatedCharacter.name).toBe('test');
		});
	});
	describe('fetchDuplicateCharacter', () => {
		it('should fetch a duplicate character', async () => {
			mockKobold.character.read.mockResolvedValue({ name: 'test' });
			const character = await fetcher.fetchDuplicateCharacter({}, {
				sheet: { staticInfo: { name: 'test' } },
			} as any);
			expect(character?.name).toBe('test');
			expect(mockKobold.character.read).toHaveBeenCalledWith({
				name: 'test',
				userId: 'testUserId',
			});
		});
	});

	describe('confirmUpdateName', () => {
		it('should confirm update name', async () => {
			const mockInteraction = {
				followUp: vitest.fn().mockResolvedValue({}),
				user: { id: 'testUserId' },
				editReply: vitest.fn().mockResolvedValue({}),
			};
			const oldName = 'oldName';
			const newName = 'newName';

			await fetcher.confirmUpdateName(oldName, newName);

			expect(mockInteraction.editReply).toHaveBeenCalled();
		});
	});
});
