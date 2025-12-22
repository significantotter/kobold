/**
 * Integration tests for CharacterImportPasteBinSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CharacterCommand } from './character-command.js';
import { CharacterImportPasteBinSubCommand } from './character-import-pastebin-subcommand.js';
import {
	createTestHarness,
	createMockCharacter,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
	type MockCharacterFetcher,
} from '../../../test-utils/index.js';
import { PasteBinCharacterFetcher } from './Fetchers/pastebin-character-fetcher.js';
import { TextParseHelpers } from '../../../utils/kobold-helpers/text-parse-helpers.js';

vi.mock('./Fetchers/pastebin-character-fetcher.js');
vi.mock('../../../utils/kobold-helpers/text-parse-helpers.js');

describe('CharacterImportPasteBinSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([
			new CharacterCommand([new CharacterImportPasteBinSubCommand()]),
		]);
	});

	describe('successful import', () => {
		it('should import a character from pastebin url', async () => {
			// Arrange
			const newCharacter = createMockCharacter({
				characterOverrides: { name: 'Pastebin Character' },
			});
			const createMock = vi.fn(async () => newCharacter);
			vi.mocked(PasteBinCharacterFetcher).mockImplementation(function (
				this: MockCharacterFetcher
			) {
				this.create = createMock;
				return this;
			} as unknown as () => PasteBinCharacterFetcher);
			vi.mocked(TextParseHelpers.parsePasteBinIdFromText).mockReturnValue('abc123');

			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'import-pastebin',
				options: { 'pastebin-url': 'https://pastebin.com/abc123' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(createMock).toHaveBeenCalledWith({ url: 'abc123' });
		});

		it('should import from raw pastebin url', async () => {
			// Arrange
			const newCharacter = createMockCharacter({
				characterOverrides: { name: 'Raw Pastebin Character' },
			});
			const createMock = vi.fn(async () => newCharacter);
			vi.mocked(PasteBinCharacterFetcher).mockImplementation(function (
				this: MockCharacterFetcher
			) {
				this.create = createMock;
				return this;
			} as unknown as () => PasteBinCharacterFetcher);
			vi.mocked(TextParseHelpers.parsePasteBinIdFromText).mockReturnValue('xyz789');

			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'import-pastebin',
				options: { 'pastebin-url': 'https://pastebin.com/raw/xyz789' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(createMock).toHaveBeenCalledWith({ url: 'xyz789' });
		});
	});

	describe('error handling', () => {
		it('should respond with error for invalid url format', async () => {
			// Arrange
			vi.mocked(TextParseHelpers.parsePasteBinIdFromText).mockReturnValue(null);

			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'import-pastebin',
				options: { 'pastebin-url': 'not-a-valid-url' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should respond with error for empty url', async () => {
			// Arrange
			vi.mocked(TextParseHelpers.parsePasteBinIdFromText).mockReturnValue(null);

			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'import-pastebin',
				options: { 'pastebin-url': '' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});
});
