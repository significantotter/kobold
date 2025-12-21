/**
 * Integration tests for GameCreateSubCommand
 */
import { describe, it, expect, beforeEach, vi, MockInstance } from 'vitest';
import { vitestKobold } from '@kobold/db/test-utils';
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
} from '../../../test-utils/index.js';
import { createMockGame } from './game-test-utils.js';

describe('GameCreateSubCommand Integration', () => {
	let harness: CommandTestHarness;
	let gameCreateSpy: MockInstance;
	let gameReadManySpy: MockInstance;
	let gameUpdateManySpy: MockInstance;

	beforeEach(() => {
		harness = createTestHarness([new GameCommand([new GameCreateSubCommand()])]);
		gameCreateSpy = vi.spyOn(vitestKobold.game, 'create');
		gameReadManySpy = vi.spyOn(vitestKobold.game, 'readMany');
		gameUpdateManySpy = vi.spyOn(vitestKobold.game, 'updateMany');
	});


	it('should create a new game', async () => {
		// Arrange
		gameReadManySpy.mockResolvedValue([]);
		gameUpdateManySpy.mockResolvedValue([]);
		const newGame = createMockGame({ name: 'New Campaign', isActive: true });
		gameCreateSpy.mockResolvedValue(newGame);

		// Act
		const result = await harness.executeCommand({
			commandName: 'game',
			subcommand: 'create',
			options: {
				[opts.gameCreateName]: 'New Campaign',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		// Assert
		expect(result.didRespond()).toBe(true);
		expect(result.getResponseContent()).toContain(
			strings.create.success({ gameName: 'New Campaign' })
		);
		expect(gameCreateSpy).toHaveBeenCalledWith(
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
		gameReadManySpy.mockResolvedValue([existingGame]);

		// Act
		const result = await harness.executeCommand({
			commandName: 'game',
			subcommand: 'create',
			options: {
				[opts.gameCreateName]: 'Existing Game',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		// Assert
		expect(result.didRespond()).toBe(true);
		expect(result.getResponseContent()).toContain(strings.create.gameAlreadyExists);
		expect(gameCreateSpy).not.toHaveBeenCalled();
	});

	it('should error when game name is too short', async () => {
		// Arrange
		gameReadManySpy.mockResolvedValue([]);

		// Act
		const result = await harness.executeCommand({
			commandName: 'game',
			subcommand: 'create',
			options: {
				[opts.gameCreateName]: 'A',
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
		gameReadManySpy.mockResolvedValue([]);
		gameUpdateManySpy.mockResolvedValue([]);
		const newGame = createMockGame({ name: 'New Game', isActive: true });
		gameCreateSpy.mockResolvedValue(newGame);

		// Act
		await harness.executeCommand({
			commandName: 'game',
			subcommand: 'create',
			options: {
				[opts.gameCreateName]: 'New Game',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		// Assert
		expect(gameUpdateManySpy).toHaveBeenCalledWith(
			{ gmUserId: TEST_USER_ID, guildId: TEST_GUILD_ID },
			{ isActive: false }
		);
	});
});
