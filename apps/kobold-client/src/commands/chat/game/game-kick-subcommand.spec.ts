/**
 * Integration tests for GameKickSubCommand
 */
import { describe, it, expect, beforeEach, vi, MockInstance } from 'vitest';
import { vitestKobold } from '@kobold/db/test-utils';
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
} from '../../../test-utils/index.js';
import { createMockGame } from './game-test-utils.js';

describe('GameKickSubCommand Integration', () => {
	let harness: CommandTestHarness;
	let gameReadManySpy: MockInstance;
	let characterUpdateSpy: MockInstance;

	beforeEach(() => {
		harness = createTestHarness([new GameCommand([new GameKickSubCommand()])]);
		gameReadManySpy = vi.spyOn(vitestKobold.game, 'readMany');
		characterUpdateSpy = vi.spyOn(vitestKobold.character, 'update');
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
		gameReadManySpy.mockResolvedValue([targetGame]);
		characterUpdateSpy.mockResolvedValue(kickedCharacter);

		// Act
		const result = await harness.executeCommand({
			commandName: 'game',
			subcommand: 'kick',
			options: {
				[opts.gameTargetGame]: 'Strict Game',
				[opts.gameKickCharacter]: 'Troublemaker',
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
		expect(characterUpdateSpy).toHaveBeenCalledWith({ id: 20 }, { gameId: null });
	});

	it('should error when game not found for kick', async () => {
		// Arrange
		gameReadManySpy.mockResolvedValue([]);

		// Act
		const result = await harness.executeCommand({
			commandName: 'game',
			subcommand: 'kick',
			options: {
				[opts.gameTargetGame]: 'No Game',
				[opts.gameKickCharacter]: 'Someone',
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
		gameReadManySpy.mockResolvedValue([targetGame]);

		// Act
		const result = await harness.executeCommand({
			commandName: 'game',
			subcommand: 'kick',
			options: {
				[opts.gameTargetGame]: 'Empty Kick Game',
				[opts.gameKickCharacter]: 'Ghost',
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
