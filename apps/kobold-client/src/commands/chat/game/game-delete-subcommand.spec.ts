/**
 * Integration tests for GameDeleteSubCommand
 */
import { describe, it, expect, beforeEach, vi, MockInstance } from 'vitest';
import { vitestKobold } from '@kobold/db/test-utils';
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
} from '../../../test-utils/index.js';
import { createMockGame } from './game-test-utils.js';

describe('GameDeleteSubCommand Integration', () => {
	let harness: CommandTestHarness;
	let gameReadManySpy: MockInstance;
	let gameDeleteSpy: MockInstance;

	beforeEach(() => {
		harness = createTestHarness([new GameCommand([new GameDeleteSubCommand()])]);
		gameReadManySpy = vi.spyOn(vitestKobold.game, 'readMany');
		gameDeleteSpy = vi.spyOn(vitestKobold.game, 'delete');
	});


	it('should delete a game', async () => {
		// Arrange
		const targetGame = createMockGame({ id: 3, name: 'Doomed Game' });
		gameReadManySpy.mockResolvedValue([targetGame]);
		gameDeleteSpy.mockResolvedValue(targetGame);

		// Act
		const result = await harness.executeCommand({
			commandName: 'game',
			subcommand: 'delete',
			options: {
				[opts.gameTargetGame]: 'Doomed Game',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		// Assert
		expect(result.didRespond()).toBe(true);
		expect(result.getResponseContent()).toContain(
			strings.delete.success({ gameName: 'Doomed Game' })
		);
		expect(gameDeleteSpy).toHaveBeenCalledWith({ id: 3 });
	});

	it('should error when deleting nonexistent game', async () => {
		// Arrange
		gameReadManySpy.mockResolvedValue([]);

		// Act
		const result = await harness.executeCommand({
			commandName: 'game',
			subcommand: 'delete',
			options: {
				[opts.gameTargetGame]: 'Ghost Game',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		// Assert
		expect(result.didRespond()).toBe(true);
		// Error is thrown via KoboldError
	});
});
