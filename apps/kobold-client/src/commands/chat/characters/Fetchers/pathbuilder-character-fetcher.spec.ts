/**
 * Unit tests for PathbuilderCharacterFetcher
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CommandInteraction, CacheType } from 'discord.js';
import { PathbuilderCharacterFetcher } from './pathbuilder-character-fetcher.js';
import { PathBuilder } from '../../../../services/pathbuilder/index.js';
import { Creature } from '../../../../utils/creature.js';
import { zPathBuilderCharacterSchema } from '../../../../services/pathbuilder/pathbuilder.zod.js';
import { fake } from 'zod-schema-faker/v4';
import { type MockPathBuilder } from '../../../../test-utils/mock-types.js';
import { getMockKobold, resetMockKobold } from '../../../../test-utils/index.js';
import type { Kobold } from '@kobold/db';

vi.mock('../../../../services/pathbuilder/index.js');
vi.mock('../../../../utils/creature.js');

const createMockPathbuilderCharacter = () => fake(zPathBuilderCharacterSchema);

const createMockInteraction = () =>
	({
		user: { id: 'test-user-id' },
		userId: 'test-user-id',
		followUp: vi.fn(),
		editReply: vi.fn(),
	} as unknown as CommandInteraction<CacheType>);

describe('PathbuilderCharacterFetcher', () => {
	const mockKobold = getMockKobold();
	let fetcher: PathbuilderCharacterFetcher;
	let mockIntr: CommandInteraction<CacheType>;

	beforeEach(() => {
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
			vi.mocked(PathBuilder).mockImplementation(function (this: MockPathBuilder) {
				(this as MockPathBuilder & { get: ReturnType<typeof vi.fn> }).get = vi
					.fn()
					.mockResolvedValue({ success: true, build: mockBuild });
				return this;
			} as unknown as () => PathBuilder);

			const result = await fetcher.fetchSourceData({ jsonId: 12345 });

			expect(result).toEqual(mockBuild);
		});

		it('should throw KoboldError when PathBuilder request fails', async () => {
			vi.mocked(PathBuilder).mockImplementation(function (this: MockPathBuilder) {
				(this as MockPathBuilder & { get: ReturnType<typeof vi.fn> }).get = vi
					.fn()
					.mockResolvedValue({ success: false });
				return this;
			} as unknown as () => PathBuilder);

			await expect(fetcher.fetchSourceData({ jsonId: 12345 })).rejects.toThrow();
		});
	});

	describe('convertSheetRecord', () => {
		it('should convert PathBuilder data to sheet record format', () => {
			const mockSourceData = createMockPathbuilderCharacter();
			const mockSheet = { staticInfo: { name: mockSourceData.name } };
			const mockActions = [{ name: 'Test Action' }];
			const mockModifiers = [{ name: 'Test Modifier' }];
			const mockRollMacros = [{ name: 'Test Macro' }];

			vi.mocked(Creature.fromPathBuilder).mockReturnValue({
				_sheet: mockSheet,
				actions: mockActions,
				modifiers: mockModifiers,
				rollMacros: mockRollMacros,
			} as unknown as Creature);

			const result = fetcher.convertSheetRecord(mockSourceData);

			expect(result).toEqual({
				sheet: mockSheet,
				actions: mockActions,
				modifiers: mockModifiers,
				rollMacros: mockRollMacros,
			});
			expect(Creature.fromPathBuilder).toHaveBeenCalledWith(mockSourceData, undefined, {
				useStamina: false,
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
			});
		});

		it('should pass active character sheet record when updating', () => {
			const mockSourceData = createMockPathbuilderCharacter();
			const mockActiveCharacter = {
				sheetRecord: { id: 'sheet-123' },
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
				mockActiveCharacter.sheetRecord,
				{ useStamina: false }
			);
		});
	});

	describe('getCharId', () => {
		it('should return the jsonId from args', () => {
			expect(fetcher.getCharId({ jsonId: 54321 })).toBe(54321);
		});
	});
});
