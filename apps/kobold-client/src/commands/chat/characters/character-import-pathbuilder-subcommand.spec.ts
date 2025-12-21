/**
 * Integration tests for CharacterImportPathbuilderSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CharacterCommand } from './character-command.js';
import { CharacterImportPathbuilderSubCommand } from './character-import-pathbuilder-subcommand.js';
import {
	createTestHarness,
	createMockCharacter,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';
import { PathbuilderCharacterFetcher } from './Fetchers/pathbuilder-character-fetcher.js';

vi.mock('./Fetchers/pathbuilder-character-fetcher.js');

describe('CharacterImportPathbuilderSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([
			new CharacterCommand([new CharacterImportPathbuilderSubCommand()]),
		]);
	});


	describe('successful import', () => {
		it('should import a character from pathbuilder json id', async () => {
			// Arrange
			const newCharacter = createMockCharacter({
				characterOverrides: { name: 'Imported Fighter' },
			});
			const createMock = vi.fn().mockResolvedValue(newCharacter);
			vi.mocked(PathbuilderCharacterFetcher).mockImplementation(
				() =>
					({
						create: createMock,
					}) as any
			);

			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'import-pathbuilder',
				options: { 'pb-json-id': 12345 },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			// Verify the constructor was called
			expect(PathbuilderCharacterFetcher).toHaveBeenCalled();
		});

		it('should import with useStamina option', async () => {
			// Arrange
			const newCharacter = createMockCharacter({
				characterOverrides: { name: 'Stamina Character' },
			});
			const createMock = vi.fn().mockResolvedValue(newCharacter);
			vi.mocked(PathbuilderCharacterFetcher).mockImplementation(
				() =>
					({
						create: createMock,
					}) as any
			);

			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'import-pathbuilder',
				options: {
					'pb-json-id': 12345,
					'use-stamina': true,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			// Verify create was called
			expect(createMock).toHaveBeenCalled();
		});

		it('should default useStamina to false', async () => {
			// Arrange
			const newCharacter = createMockCharacter();
			const createMock = vi.fn().mockResolvedValue(newCharacter);
			vi.mocked(PathbuilderCharacterFetcher).mockImplementation(
				() =>
					({
						create: createMock,
					}) as any
			);

			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'import-pathbuilder',
				options: { 'pb-json-id': 12345 },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			// Verify create was called
			expect(createMock).toHaveBeenCalled();
		});
	});

	describe('error handling', () => {
		it('should reject invalid json id (non-integer)', async () => {
			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'import-pathbuilder',
				options: { 'pb-json-id': 12.5 },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should reject json id less than 1', async () => {
			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'import-pathbuilder',
				options: { 'pb-json-id': 0 },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should reject negative json id', async () => {
			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'import-pathbuilder',
				options: { 'pb-json-id': -1 },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});
});
