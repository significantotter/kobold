/**
 * Unit tests for GameListSubCommand
 *
 * This command lists all games run by the user in the current guild.
 */
import { describe, it, expect, beforeEach, vi, MockInstance } from 'vitest';
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
	getMockKobold,
	resetMockKobold,} from '../../../test-utils/index.js';
import { createMockGame, createMockParty } from './game-test-utils.js';

describe('GameListSubCommand', () => {
	const kobold = getMockKobold();

	let harness: CommandTestHarness;

	beforeEach(() => {
		resetMockKobold(kobold);
		harness = createTestHarness([new GameCommand([new GameListSubCommand()])]);
	});

	describe('listing games', () => {
		it('should show message when user has no games', async () => {
			// Arrange
			kobold.game.readMany.mockResolvedValue([]);

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
			kobold.game.readMany.mockResolvedValue([game]);

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
			kobold.game.readMany.mockResolvedValue(games);

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
			kobold.game.readMany.mockResolvedValue(games);

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
			kobold.game.readMany.mockResolvedValue([game]);

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
			kobold.game.readMany.mockResolvedValue([game]);

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
			kobold.game.readMany.mockResolvedValue([]);

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
			expect(kobold.game.readMany).toHaveBeenCalled();
			const callArgs = kobold.game.readMany.mock.calls[0][0] as any;
			expect(callArgs.gmUserId).toBe(TEST_USER_ID);
		});
	});
});
