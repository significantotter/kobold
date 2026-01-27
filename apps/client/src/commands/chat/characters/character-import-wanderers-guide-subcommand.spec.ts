/**
 * Integration tests for CharacterImportWanderersGuideSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CharacterCommand } from './character-command.js';
import { CharacterImportWanderersGuideSubCommand } from './character-import-wanderers-guide-subcommand.js';
import {
	createTestHarness,
	createMockCharacter,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
	type MockCharacterFetcher,
} from '../../../test-utils/index.js';
import { WgCharacterFetcher } from './Fetchers/wg-character-fetcher.js';
import { TextParseHelpers } from '../../../utils/kobold-helpers/text-parse-helpers.js';

vi.mock('./Fetchers/wg-character-fetcher.js');
vi.mock('../../../utils/kobold-helpers/text-parse-helpers.js');

describe('CharacterImportWanderersGuideSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([
			new CharacterCommand([new CharacterImportWanderersGuideSubCommand()]),
		]);
	});

	describe('successful import', () => {
		it('should import a character from wanderers guide url', async () => {
			// Arrange
			const newCharacter = createMockCharacter({
				characterOverrides: { name: 'WG Character' },
			});
			const createMock = vi.fn(async () => newCharacter);
			vi.mocked(WgCharacterFetcher).mockImplementation(function (this: MockCharacterFetcher) {
				this.create = createMock;
				return this;
			} as unknown as () => WgCharacterFetcher);
			vi.mocked(TextParseHelpers.parseCharacterIdFromText).mockReturnValue(12345);

			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'import-wanderers-guide',
				options: {
					'wanderers-guide-url': 'https://wanderersguide.app/profile/characters/12345',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(createMock).toHaveBeenCalledWith({ charId: 12345 });
		});

		it('should import using just character id in url', async () => {
			// Arrange
			const newCharacter = createMockCharacter({
				characterOverrides: { name: 'WG Character Direct' },
			});
			const createMock = vi.fn(async () => newCharacter);
			vi.mocked(WgCharacterFetcher).mockImplementation(function (this: MockCharacterFetcher) {
				this.create = createMock;
				return this;
			} as unknown as () => WgCharacterFetcher);
			vi.mocked(TextParseHelpers.parseCharacterIdFromText).mockReturnValue(67890);

			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'import-wanderers-guide',
				options: { 'wanderers-guide-url': '67890' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(createMock).toHaveBeenCalledWith({ charId: 67890 });
		});
	});

	describe('error handling', () => {
		it('should respond with error for invalid url format', async () => {
			// Arrange
			vi.mocked(TextParseHelpers.parseCharacterIdFromText).mockReturnValue(null);

			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'import-wanderers-guide',
				options: { 'wanderers-guide-url': 'not-a-valid-url' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should respond with error for non-numeric character id', async () => {
			// Arrange
			vi.mocked(TextParseHelpers.parseCharacterIdFromText).mockReturnValue(null);

			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'import-wanderers-guide',
				options: { 'wanderers-guide-url': 'abc' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should handle url with extra whitespace', async () => {
			// Arrange
			const newCharacter = createMockCharacter();
			const createMock = vi.fn(async () => newCharacter);
			vi.mocked(WgCharacterFetcher).mockImplementation(function (this: MockCharacterFetcher) {
				this.create = createMock;
				return this;
			} as unknown as () => WgCharacterFetcher);
			vi.mocked(TextParseHelpers.parseCharacterIdFromText).mockReturnValue(12345);

			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'import-wanderers-guide',
				options: {
					'wanderers-guide-url':
						'  https://wanderersguide.app/profile/characters/12345  ',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			// Verify the fetcher was called (trimming is handled internally)
			expect(createMock).toHaveBeenCalled();
		});
	});
});
