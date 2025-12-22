/**
 * Integration tests for CharacterUpdateSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CharacterCommand } from './character-command.js';
import { CharacterUpdateSubCommand } from './character-update-subcommand.js';
import {
	createTestHarness,
	createMockCharacter,
	setupKoboldUtilsMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
	type MockCharacterFetcher,
} from '../../../test-utils/index.js';
import { PathbuilderCharacterFetcher } from './Fetchers/pathbuilder-character-fetcher.js';
import { WgCharacterFetcher } from './Fetchers/wg-character-fetcher.js';
import { PasteBinCharacterFetcher } from './Fetchers/pastebin-character-fetcher.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('./Fetchers/pathbuilder-character-fetcher.js');
vi.mock('./Fetchers/wg-character-fetcher.js');
vi.mock('./Fetchers/pastebin-character-fetcher.js');

describe('CharacterUpdateSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new CharacterCommand([new CharacterUpdateSubCommand()])]);
	});

	describe('updating pathbuilder character', () => {
		it('should update a pathbuilder character with existing json id', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({
				characterOverrides: {
					importSource: 'pathbuilder',
					charId: 12345,
				},
			});
			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			const updatedCharacter = createMockCharacter({
				characterOverrides: { name: 'Updated Character' },
			});
			const updateMock = vi.fn(async () => updatedCharacter);
			vi.mocked(PathbuilderCharacterFetcher).mockImplementation(function (
				this: MockCharacterFetcher
			) {
				this.update = updateMock;
				return this;
			} as unknown as () => PathbuilderCharacterFetcher);

			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'update',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalledWith({ jsonId: 12345 });
		});

		it('should update with new json id when provided', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({
				characterOverrides: {
					importSource: 'pathbuilder',
					charId: 12345,
				},
			});
			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			const updatedCharacter = createMockCharacter({
				characterOverrides: { name: 'Updated Character' },
			});
			const updateMock = vi.fn(async () => updatedCharacter);
			vi.mocked(PathbuilderCharacterFetcher).mockImplementation(function (
				this: MockCharacterFetcher
			) {
				this.update = updateMock;
				return this;
			} as unknown as () => PathbuilderCharacterFetcher);

			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'update',
				options: { 'pb-json-id': 67890 },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalledWith({ jsonId: 67890 });
		});

		it('should respect useStamina option', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({
				characterOverrides: {
					importSource: 'pathbuilder',
					charId: 12345,
				},
			});
			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			const updatedCharacter = createMockCharacter();
			const updateMock = vi.fn(async () => updatedCharacter);
			vi.mocked(PathbuilderCharacterFetcher).mockImplementation(function (
				this: MockCharacterFetcher
			) {
				this.update = updateMock;
				return this;
			} as unknown as () => PathbuilderCharacterFetcher);

			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'update',
				options: { 'use-stamina': true },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			// Constructor should be called with useStamina option
			expect(PathbuilderCharacterFetcher).toHaveBeenCalledWith(
				expect.anything(),
				expect.anything(),
				TEST_USER_ID,
				expect.objectContaining({ useStamina: true })
			);
		});
	});

	describe('updating wanderers guide character', () => {
		it('should update a wanderers guide character', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({
				characterOverrides: {
					importSource: 'wanderers-guide',
					charId: 54321,
				},
			});
			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			const updatedCharacter = createMockCharacter({
				characterOverrides: { name: 'Updated WG Character' },
			});
			const updateMock = vi.fn(async () => updatedCharacter);
			vi.mocked(WgCharacterFetcher).mockImplementation(function (this: MockCharacterFetcher) {
				this.update = updateMock;
				return this;
			} as unknown as () => WgCharacterFetcher);

			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'update',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalledWith({ charId: 54321 });
		});
	});

	describe('updating pastebin character', () => {
		it('should update a pastebin character with new url', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({
				characterOverrides: {
					importSource: 'pastebin',
				},
			});
			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			const updatedCharacter = createMockCharacter({
				characterOverrides: { name: 'Updated Pastebin Character' },
			});
			const updateMock = vi.fn(async () => updatedCharacter);
			vi.mocked(PasteBinCharacterFetcher).mockImplementation(function (
				this: MockCharacterFetcher
			) {
				this.update = updateMock;
				return this;
			} as unknown as () => PasteBinCharacterFetcher);

			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'update',
				options: { 'pastebin-url': 'https://pastebin.com/abc123' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});
	});

	describe('error handling', () => {
		it('should error when useStamina is used with non-pathbuilder character', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({
				characterOverrides: {
					importSource: 'wanderers-guide',
					charId: 54321,
				},
			});
			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'update',
				options: { 'use-stamina': true },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - should respond with error
			expect(result.didRespond()).toBe(true);
		});
	});
});
