/**
 * Integration tests for GameListSubCommand
 *
 * This command lists all games run by the user in the current guild.
 */
import { describe, it, expect, beforeEach, vi, MockInstance } from 'vitest';
import { vitestKobold } from '@kobold/db/test-utils';
import { GameDefinition } from '@kobold/documentation';
import { GameCommand } from './game-command.js';
import { GameListSubCommand } from './game-list-subcommand.js';

const strings = GameDefinition.strings;

import {
	createTestHarness,
	createMockCharacter,
	getFullEmbedContent,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';
import { createMockGame, createMockParty } from './game-test-utils.js';

describe('GameListSubCommand Integration', () => {
	let harness: CommandTestHarness;
	let gameReadManySpy: MockInstance;

	beforeEach(() => {
		harness = createTestHarness([new GameCommand([new GameListSubCommand()])]);
		gameReadManySpy = vi.spyOn(vitestKobold.game, 'readMany');
	});


	describe('listing games', () => {
		it('should show message when user has no games', async () => {
			// Arrange
			gameReadManySpy.mockResolvedValue([]);

			// Act
			const result = await harness.executeCommand({
				commandName: 'game',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(result.getResponseContent()).toContain(strings.noGames);
		});

		it('should list a single game', async () => {
			// Arrange
			const game = createMockGame({ name: 'My Campaign' });
			gameReadManySpy.mockResolvedValue([game]);

			// Act
			const result = await harness.executeCommand({
				commandName: 'game',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			const content = getFullEmbedContent(result.interaction as any);
			expect(content).toContain('My Campaign');
		});

		it('should list multiple games', async () => {
			// Arrange
			const games = [
				createMockGame({ id: 1, name: 'Campaign A' }),
				createMockGame({ id: 2, name: 'Campaign B' }),
				createMockGame({ id: 3, name: 'Campaign C' }),
			];
			gameReadManySpy.mockResolvedValue(games);

			// Act
			const result = await harness.executeCommand({
				commandName: 'game',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			const content = getFullEmbedContent(result.interaction as any);
			expect(content).toContain('Campaign A');
			expect(content).toContain('Campaign B');
			expect(content).toContain('Campaign C');
		});

		it('should indicate which game is active', async () => {
			// Arrange
			const games = [
				createMockGame({ id: 1, name: 'Active Game', isActive: true }),
				createMockGame({ id: 2, name: 'Inactive Game', isActive: false }),
			];
			gameReadManySpy.mockResolvedValue(games);

			// Act
			const result = await harness.executeCommand({
				commandName: 'game',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			const content = getFullEmbedContent(result.interaction as any);
			expect(content).toContain('Active Game (active)');
			expect(content).not.toContain('Inactive Game (active)');
		});

		it('should list characters in a game', async () => {
			// Arrange
			const char1 = createMockCharacter({ characterOverrides: { name: 'Aragorn' } });
			const char2 = createMockCharacter({ characterOverrides: { name: 'Legolas' } });
			const game = createMockGame({ name: 'Fellowship', characters: [char1, char2] });
			gameReadManySpy.mockResolvedValue([game]);

			// Act
			const result = await harness.executeCommand({
				commandName: 'game',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			const content = getFullEmbedContent(result.interaction as any);
			expect(content).toContain('Aragorn');
			expect(content).toContain('Legolas');
		});

		it('should show "No characters added" for empty game', async () => {
			// Arrange
			const game = createMockGame({ name: 'Empty Game', characters: [] });
			gameReadManySpy.mockResolvedValue([game]);

			// Act
			const result = await harness.executeCommand({
				commandName: 'game',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			const content = getFullEmbedContent(result.interaction as any);
			expect(content).toContain(strings.list.gameListEmbed.noCharacters);
		});

		it('should query games with correct user ID', async () => {
			// Arrange
			gameReadManySpy.mockResolvedValue([]);

			// Act
			await harness.executeCommand({
				commandName: 'game',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - verify the user ID is passed correctly
			// Note: guild.id may be undefined in mock interactions
			expect(gameReadManySpy).toHaveBeenCalled();
			const callArgs = gameReadManySpy.mock.calls[0][0] as any;
			expect(callArgs.gmUserId).toBe(TEST_USER_ID);
		});
	});
});
