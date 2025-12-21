/**
 * Integration tests for CharacterSetDefaultSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vitestKobold } from '@kobold/db/test-utils';
import { CharacterCommand } from './character-command.js';
import { CharacterSetDefaultSubCommand } from './character-set-default.subcommand.js';
import {
	createTestHarness,
	createMockCharacter,
	setupCharacterUtilsMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	TEST_CHANNEL_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');

describe('CharacterSetDefaultSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new CharacterCommand([new CharacterSetDefaultSubCommand()])]);
	});


	describe('set default for channel', () => {
		it('should set default character for channel', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({
				characterOverrides: { name: 'TestCharacter' },
			});
			setupCharacterUtilsMocks([mockCharacter]);

			// Mock database operations to avoid foreign key violations
			vi.spyOn(vitestKobold.channelDefaultCharacter, 'deleteIfExists').mockResolvedValue();
			vi.spyOn(vitestKobold.channelDefaultCharacter, 'create').mockResolvedValue({
				userId: TEST_USER_ID,
				channelId: TEST_CHANNEL_ID,
				characterId: mockCharacter.id,
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'set-default',
				options: {
					'default-for': 'channel',
					name: 'TestCharacter',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
				channelId: TEST_CHANNEL_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(result.getResponseContent()).toContain('TestCharacter');
			expect(result.getResponseContent()).toContain('channel');
		});

		it('should remove channel default when none is selected', async () => {
			// Arrange - empty result means no character found
			setupCharacterUtilsMocks([]);

			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'set-default',
				options: {
					'default-for': 'channel',
					name: '__NONE__',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
				channelId: TEST_CHANNEL_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('set default for server', () => {
		it('should set default character for server', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({
				characterOverrides: { name: 'TestCharacter' },
			});
			setupCharacterUtilsMocks([mockCharacter]);

			// Mock database operations to avoid foreign key violations
			vi.spyOn(vitestKobold.guildDefaultCharacter, 'deleteIfExists').mockResolvedValue();
			vi.spyOn(vitestKobold.guildDefaultCharacter, 'create').mockResolvedValue({
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
				characterId: mockCharacter.id,
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'set-default',
				options: {
					'default-for': 'server',
					name: 'TestCharacter',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
				channelId: TEST_CHANNEL_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(result.getResponseContent()).toContain('TestCharacter');
			expect(result.getResponseContent()).toContain('server');
		});

		it('should remove server default when none is selected', async () => {
			// Arrange - empty result means no character found
			setupCharacterUtilsMocks([]);

			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'set-default',
				options: {
					'default-for': 'server',
					name: '__NONE__',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
				channelId: TEST_CHANNEL_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('error handling', () => {
		it('should show not found message when character does not exist', async () => {
			// Arrange - empty result means no character found
			setupCharacterUtilsMocks([]);

			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'set-default',
				options: {
					'default-for': 'channel',
					name: 'NonexistentCharacter',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
				channelId: TEST_CHANNEL_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(result.getResponseContent()).toContain('find');
		});
	});

	describe('autocomplete', () => {
		it("should return matching characters for 'name' option", async () => {
			// Arrange
			const mockCharacter1 = createMockCharacter({
				characterOverrides: { name: 'TestCharacter1' },
			});
			const mockCharacter2 = createMockCharacter({
				characterOverrides: { name: 'TestCharacter2' },
			});
			setupCharacterUtilsMocks([mockCharacter1, mockCharacter2]);

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'character',
				subcommand: 'set-default',
				options: { name: 'Test' },
				focusedOption: { name: 'name', value: 'Test' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.getChoices().length).toBeGreaterThan(0);
		});

		it('should return none option when empty string is provided', async () => {
			// Arrange
			setupCharacterUtilsMocks([]);

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'character',
				subcommand: 'set-default',
				options: { name: '' },
				focusedOption: { name: 'name', value: '' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			const choices = result.getChoices();
			expect(choices.some(c => c.value === '__NONE__')).toBe(true);
		});
	});
});
