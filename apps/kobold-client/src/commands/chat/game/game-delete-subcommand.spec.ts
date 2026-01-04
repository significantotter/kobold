/**
 * Unit tests for GameDeleteSubCommand
 */
import { describe, it, expect, beforeEach, vi, MockInstance } from 'vitest';
import { GameDefinition } from '@kobold/documentation';
import { GameCommand } from './game-command.js';
import { GameDeleteSubCommand } from './game-delete-subcommand.js';

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

describe('GameDeleteSubCommand', () => {
	const kobold = getMockKobold();

	let harness: CommandTestHarness;

	beforeEach(() => {
		resetMockKobold(kobold);
		harness = createTestHarness([new GameCommand([new GameDeleteSubCommand()])]);
	});

	it('should delete a game', async () => {
		// Arrange
		const targetGame = createMockGame({ id: 3, name: 'Doomed Game' });
		kobold.game.readMany.mockResolvedValue([targetGame]);
		kobold.game.delete.mockResolvedValue(targetGame);

		// Act
		const result = await harness.executeCommand({
			commandName: 'game',
			subcommand: 'delete',
			options: {
				[opts.targetGame]: 'Doomed Game',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		// Assert
		expect(result.didRespond()).toBe(true);
		expect(result.getResponseContent()).toContain(
			strings.delete.success({ gameName: 'Doomed Game' })
		);
		expect(kobold.game.delete).toHaveBeenCalledWith({ id: 3 });
	});

	it('should error when deleting nonexistent game', async () => {
		// Arrange
		kobold.game.readMany.mockResolvedValue([]);

		// Act
		const result = await harness.executeCommand({
			commandName: 'game',
			subcommand: 'delete',
			options: {
				[opts.targetGame]: 'Ghost Game',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		// Assert
		expect(result.didRespond()).toBe(true);
		// Error is thrown via KoboldError
	});
});
