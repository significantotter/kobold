/**
 * Unit tests for GameCreateSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameDefinition } from '@kobold/documentation';
import { GameCommand } from './game-command.js';
import { GameCreateSubCommand } from './game-create-subcommand.js';

const opts = GameDefinition.commandOptionsEnum;
const strings = GameDefinition.strings;

import {
	createTestHarness,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
	getMockKobold,
	resetMockKobold,
} from '../../../test-utils/index.js';
import { createMockGame } from './game-test-utils.js';

describe('GameCreateSubCommand', () => {
	let harness: CommandTestHarness;
	const kobold = getMockKobold();

	beforeEach(() => {
		resetMockKobold(kobold);
		harness = createTestHarness([new GameCommand([new GameCreateSubCommand()])]);
	});

	it('should create a new game', async () => {
		// Arrange
		kobold.game.readMany.mockResolvedValue([]);
		kobold.game.updateMany.mockResolvedValue([]);
		const newGame = createMockGame({ name: 'New Campaign', isActive: true });
		kobold.game.create.mockResolvedValue(newGame);

		// Act
		const result = await harness.executeCommand({
			commandName: 'game',
			subcommand: 'create',
			options: {
				[opts.createName]: 'New Campaign',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		// Assert
		expect(result.didRespond()).toBe(true);
		expect(result.getResponseContent()).toContain(
			strings.create.success({ gameName: 'New Campaign' })
		);
		expect(kobold.game.create).toHaveBeenCalledWith(
			expect.objectContaining({
				name: 'New Campaign',
				gmUserId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
				isActive: true,
			})
		);
	});

	it('should error when game name already exists', async () => {
		// Arrange
		const existingGame = createMockGame({ name: 'Existing Game' });
		kobold.game.readMany.mockResolvedValue([existingGame]);

		// Act
		const result = await harness.executeCommand({
			commandName: 'game',
			subcommand: 'create',
			options: {
				[opts.createName]: 'Existing Game',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		// Assert
		expect(result.didRespond()).toBe(true);
		expect(result.getResponseContent()).toContain(strings.create.gameAlreadyExists);
		expect(kobold.game.create).not.toHaveBeenCalled();
	});

	it('should error when game name is too short', async () => {
		// Arrange
		kobold.game.readMany.mockResolvedValue([]);

		// Act
		const result = await harness.executeCommand({
			commandName: 'game',
			subcommand: 'create',
			options: {
				[opts.createName]: 'A',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		// Assert
		expect(result.didRespond()).toBe(true);
		expect(result.getResponseContent()).toContain(strings.create.gameNameTooShort);
	});

	it('should deactivate existing games when creating a new one', async () => {
		// Arrange
		kobold.game.readMany.mockResolvedValue([]);
		kobold.game.updateMany.mockResolvedValue([]);
		const newGame = createMockGame({ name: 'New Game', isActive: true });
		kobold.game.create.mockResolvedValue(newGame);

		// Act
		await harness.executeCommand({
			commandName: 'game',
			subcommand: 'create',
			options: {
				[opts.createName]: 'New Game',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		// Assert
		expect(kobold.game.updateMany).toHaveBeenCalledWith(
			{ gmUserId: TEST_USER_ID, guildId: TEST_GUILD_ID },
			{ isActive: false }
		);
	});
});
