/**
 * Integration tests for GameJoinSubCommand
 */
import { describe, it, expect, beforeEach, vi, MockInstance } from 'vitest';
import { vitestKobold } from '@kobold/db/test-utils';
import { GameDefinition } from '@kobold/documentation';
import { GameCommand } from './game-command.js';
import { GameJoinSubCommand } from './game-join-subcommand.js';

const opts = GameDefinition.commandOptionsEnum;
const strings = GameDefinition.strings;

import {
	createTestHarness,
	createMockCharacter,
	setupKoboldUtilsMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';
import { createMockGame } from './game-test-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');

describe('GameJoinSubCommand Integration', () => {
	let harness: CommandTestHarness;
	let gameReadManySpy: MockInstance;
	let characterUpdateSpy: MockInstance;

	beforeEach(() => {
		harness = createTestHarness([new GameCommand([new GameJoinSubCommand()])]);
		gameReadManySpy = vi.spyOn(vitestKobold.game, 'readMany');
		characterUpdateSpy = vi.spyOn(vitestKobold.character, 'update');
	});


	it('should join a game successfully', async () => {
		// Arrange
		const mockCharacter = createMockCharacter({
			characterOverrides: { id: 10, name: 'Hero' },
		});
		const targetGame = createMockGame({ id: 5, name: 'Adventure', characters: [] });
		gameReadManySpy.mockResolvedValue([targetGame]);
		characterUpdateSpy.mockResolvedValue(mockCharacter);

		const { fetchDataMock } = setupKoboldUtilsMocks();
		fetchDataMock.mockResolvedValue({ activeCharacter: mockCharacter });

		// Act
		const result = await harness.executeCommand({
			commandName: 'game',
			subcommand: 'join',
			options: {
				[opts.gameTargetGame]: 'Adventure',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		// Assert
		expect(result.didRespond()).toBe(true);
		expect(result.getResponseContent()).toContain(
			strings.join.success({ characterName: 'Hero', gameName: 'Adventure' })
		);
		expect(characterUpdateSpy).toHaveBeenCalledWith({ id: 10 }, { gameId: 5 });
	});

	it('should error when game not found', async () => {
		// Arrange
		gameReadManySpy.mockResolvedValue([]);

		// Act
		const result = await harness.executeCommand({
			commandName: 'game',
			subcommand: 'join',
			options: {
				[opts.gameTargetGame]: 'Missing Game',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		// Assert
		expect(result.didRespond()).toBe(true);
		expect(result.getResponseContent()).toContain(
			strings.notFound({ gameName: 'Missing Game' })
		);
	});

	it('should error when character already in game', async () => {
		// Arrange
		const mockCharacter = createMockCharacter({
			characterOverrides: { id: 10, name: 'Hero' },
		});
		const targetGame = createMockGame({
			id: 5,
			name: 'Adventure',
			characters: [mockCharacter],
		});
		gameReadManySpy.mockResolvedValue([targetGame]);

		const { fetchDataMock } = setupKoboldUtilsMocks();
		fetchDataMock.mockResolvedValue({ activeCharacter: mockCharacter });

		// Act
		const result = await harness.executeCommand({
			commandName: 'game',
			subcommand: 'join',
			options: {
				[opts.gameTargetGame]: 'Adventure',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		// Assert
		expect(result.didRespond()).toBe(true);
		expect(result.getResponseContent()).toContain(
			strings.join.alreadyInGame({ characterName: 'Hero', gameName: 'Adventure' })
		);
	});
});
