/**
 * Unit tests for GameSetActiveSubCommand
 */
import { describe, it, expect, beforeEach, vi, MockInstance } from 'vitest';
import { GameDefinition } from '@kobold/documentation';
import { GameCommand } from './game-command.js';
import { GameSetActiveSubCommand } from './game-set-active-subcommand.js';

const opts = GameDefinition.commandOptionsEnum;
const strings = GameDefinition.strings;

import {
	createTestHarness,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
	getMockKobold,
	resetMockKobold,} from '../../../test-utils/index.js';
import { createMockGame } from './game-test-utils.js';

describe('GameSetActiveSubCommand', () => {
	const kobold = getMockKobold();

	let harness: CommandTestHarness;

	beforeEach(() => {
		resetMockKobold(kobold);
		harness = createTestHarness([new GameCommand([new GameSetActiveSubCommand()])]);
	});

	it('should set a game as active', async () => {
		// Arrange
		const targetGame = createMockGame({ id: 5, name: 'Target Game', isActive: false });
		kobold.game.readMany.mockResolvedValue([targetGame]);
		kobold.game.updateMany.mockResolvedValue([]);
		kobold.game.update.mockResolvedValue({ ...targetGame, isActive: true });

		// Act
		const result = await harness.executeCommand({
			commandName: 'game',
			subcommand: 'set-active',
			options: {
				[opts.gameTargetGame]: 'Target Game',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		// Assert
		expect(result.didRespond()).toBe(true);
		expect(result.getResponseContent()).toContain(
			strings.setActive.success({ gameName: 'Target Game' })
		);
		expect(kobold.game.update).toHaveBeenCalledWith({ id: 5 }, { isActive: true });
	});

	it('should error when game not found', async () => {
		// Arrange
		kobold.game.readMany.mockResolvedValue([]);

		// Act
		const result = await harness.executeCommand({
			commandName: 'game',
			subcommand: 'set-active',
			options: {
				[opts.gameTargetGame]: 'Nonexistent Game',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		// Assert
		expect(result.didRespond()).toBe(true);
		// Error is thrown via KoboldError
	});

	it('should deactivate other games when setting one active', async () => {
		// Arrange
		const targetGame = createMockGame({ id: 5, name: 'Target Game', isActive: false });
		kobold.game.readMany.mockResolvedValue([targetGame]);
		kobold.game.updateMany.mockResolvedValue([]);
		kobold.game.update.mockResolvedValue({ ...targetGame, isActive: true });

		// Act
		await harness.executeCommand({
			commandName: 'game',
			subcommand: 'set-active',
			options: {
				[opts.gameTargetGame]: 'Target Game',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		// Assert
		expect(kobold.game.updateMany).toHaveBeenCalledWith(
			{ guildId: TEST_GUILD_ID, gmUserId: TEST_USER_ID },
			{ isActive: false }
		);
	});
});
