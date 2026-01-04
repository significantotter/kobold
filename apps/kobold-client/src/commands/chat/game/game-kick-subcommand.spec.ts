/**
 * Unit tests for GameKickSubCommand
 */
import { describe, it, expect, beforeEach, vi, MockInstance } from 'vitest';
import { GameDefinition } from '@kobold/documentation';
import { GameCommand } from './game-command.js';
import { GameKickSubCommand } from './game-kick-subcommand.js';

const opts = GameDefinition.commandOptionsEnum;
const strings = GameDefinition.strings;

import {
	createTestHarness,
	createMockCharacter,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
	getMockKobold,
	resetMockKobold,
} from '../../../test-utils/index.js';
import { createMockGame } from './game-test-utils.js';

describe('GameKickSubCommand', () => {
	const kobold = getMockKobold();

	let harness: CommandTestHarness;

	beforeEach(() => {
		resetMockKobold(kobold);
		harness = createTestHarness([new GameCommand([new GameKickSubCommand()])]);
	});

	it('should kick a character from a game', async () => {
		// Arrange
		const kickedCharacter = createMockCharacter({
			characterOverrides: { id: 20, name: 'Troublemaker' },
		});
		const targetGame = createMockGame({
			id: 6,
			name: 'Strict Game',
			characters: [kickedCharacter],
		});
		kobold.game.readMany.mockResolvedValue([targetGame]);
		kobold.character.update.mockResolvedValue(kickedCharacter);

		// Act
		const result = await harness.executeCommand({
			commandName: 'game',
			subcommand: 'kick',
			options: {
				[opts.targetGame]: 'Strict Game',
				[opts.targetCharacter]: 'Troublemaker',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		// Assert
		expect(result.didRespond()).toBe(true);
		expect(result.getResponseContent()).toContain(
			strings.kick.success({
				characterName: 'Troublemaker',
				gameName: 'Strict Game',
			})
		);
		expect(kobold.character.update).toHaveBeenCalledWith({ id: 20 }, { gameId: null });
	});

	it('should error when game not found for kick', async () => {
		// Arrange
		kobold.game.readMany.mockResolvedValue([]);

		// Act
		const result = await harness.executeCommand({
			commandName: 'game',
			subcommand: 'kick',
			options: {
				[opts.targetGame]: 'No Game',
				[opts.targetCharacter]: 'Someone',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		// Assert
		expect(result.didRespond()).toBe(true);
		expect(result.getResponseContent()).toContain(strings.notFound({ gameName: 'No Game' }));
	});

	it('should error when character not in game for kick', async () => {
		// Arrange
		const targetGame = createMockGame({
			name: 'Empty Kick Game',
			characters: [],
		});
		kobold.game.readMany.mockResolvedValue([targetGame]);

		// Act
		const result = await harness.executeCommand({
			commandName: 'game',
			subcommand: 'kick',
			options: {
				[opts.targetGame]: 'Empty Kick Game',
				[opts.targetCharacter]: 'Ghost',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		// Assert
		expect(result.didRespond()).toBe(true);
		expect(result.getResponseContent()).toContain(
			strings.kick.characterNotInGame({
				characterName: 'Ghost',
				gameName: 'Empty Kick Game',
			})
		);
	});
});
