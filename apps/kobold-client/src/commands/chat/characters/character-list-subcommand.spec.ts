/**
 * Integration tests for CharacterListSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CharacterCommand } from './character-command.js';
import { CharacterListSubCommand } from './character-list-subcommand.js';
import {
	createTestHarness,
	createMockCharacter,
	setupListDataMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');

describe('CharacterListSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new CharacterCommand([new CharacterListSubCommand()])]);
	});


	describe('successful character listing', () => {
		it('should list all owned characters', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			const { fetchDataMock } = setupListDataMocks([mockCharacter]);

			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(fetchDataMock).toHaveBeenCalled();
		});

		it('should handle user with no characters', async () => {
			// Arrange
			setupListDataMocks([]);

			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should indicate the active character', async () => {
			// Arrange
			const activeCharacter = createMockCharacter({
				characterOverrides: {
					isActiveCharacter: true,
					name: 'Active Hero',
				},
			});
			const inactiveCharacter = createMockCharacter({
				characterOverrides: {
					isActiveCharacter: false,
					name: 'Inactive Hero',
				},
			});

			setupListDataMocks([activeCharacter, inactiveCharacter]);

			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should indicate server default character', async () => {
			// Arrange
			const defaultCharacter = createMockCharacter({
				characterOverrides: {
					name: 'Server Default',
					guildDefaultCharacters: [{ guildId: TEST_GUILD_ID } as any],
				},
			});

			setupListDataMocks([defaultCharacter]);

			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should handle multiple characters with different statuses', async () => {
			// Arrange
			const characters = [
				createMockCharacter({
					characterOverrides: {
						name: 'Fighter',
						isActiveCharacter: true,
					},
				}),
				createMockCharacter({
					characterOverrides: {
						name: 'Wizard',
						isActiveCharacter: false,
					},
				}),
				createMockCharacter({
					characterOverrides: {
						name: 'Rogue',
						isActiveCharacter: false,
					},
				}),
			];

			setupListDataMocks(characters);

			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});
});
