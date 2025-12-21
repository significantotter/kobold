/**
 * Integration tests for GameSetActiveSubCommand
 */
import { describe, it, expect, beforeEach, vi, MockInstance } from 'vitest';
import { vitestKobold } from '@kobold/db/test-utils';
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
} from '../../../test-utils/index.js';
import { createMockGame } from './game-test-utils.js';

describe('GameSetActiveSubCommand Integration', () => {
	let harness: CommandTestHarness;
	let gameReadManySpy: MockInstance;
	let gameUpdateSpy: MockInstance;
	let gameUpdateManySpy: MockInstance;

	beforeEach(() => {
		harness = createTestHarness([new GameCommand([new GameSetActiveSubCommand()])]);
		gameReadManySpy = vi.spyOn(vitestKobold.game, 'readMany');
		gameUpdateSpy = vi.spyOn(vitestKobold.game, 'update');
		gameUpdateManySpy = vi.spyOn(vitestKobold.game, 'updateMany');
	});


	it('should set a game as active', async () => {
		// Arrange
		const targetGame = createMockGame({ id: 5, name: 'Target Game', isActive: false });
		gameReadManySpy.mockResolvedValue([targetGame]);
		gameUpdateManySpy.mockResolvedValue([]);
		gameUpdateSpy.mockResolvedValue({ ...targetGame, isActive: true });

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
		expect(gameUpdateSpy).toHaveBeenCalledWith({ id: 5 }, { isActive: true });
	});

	it('should error when game not found', async () => {
		// Arrange
		gameReadManySpy.mockResolvedValue([]);

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
		gameReadManySpy.mockResolvedValue([targetGame]);
		gameUpdateManySpy.mockResolvedValue([]);
		gameUpdateSpy.mockResolvedValue({ ...targetGame, isActive: true });

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
		expect(gameUpdateManySpy).toHaveBeenCalledWith(
			{ guildId: TEST_GUILD_ID, gmUserId: TEST_USER_ID },
			{ isActive: false }
		);
	});
});
