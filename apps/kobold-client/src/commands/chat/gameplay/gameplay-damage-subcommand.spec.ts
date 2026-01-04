/**
 * Integration tests for GameplayDamageSubCommand
 *
 * This command applies damage (or healing with negative values) to a target character.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameplayDefinition } from '@kobold/documentation';
import { GameplayCommand } from './gameplay-command.js';
import { GameplayDamageSubCommand } from './gameplay-damage-subcommand.js';

const opts = GameplayDefinition.commandOptionsEnum;

import {
	createTestHarness,
	createMockCharacter,
	setupKoboldUtilsMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');

describe('GameplayDamageSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new GameplayCommand([new GameplayDamageSubCommand()])]);
	});

	describe('Damage Application', () => {
		it('should respond when applying damage', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({ characterOverrides: { name: 'Fighter' } });
			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({ activeCharacter: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'gameplay',
				subcommand: 'damage',
				options: {
					[opts.targetCharacter]: 'Fighter',
					[opts.damageAmount]: 10,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should respond when applying typed damage', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({ characterOverrides: { name: 'Wizard' } });
			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({ activeCharacter: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'gameplay',
				subcommand: 'damage',
				options: {
					[opts.targetCharacter]: 'Wizard',
					[opts.damageAmount]: 15,
					[opts.damageType]: 'fire',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should respond when applying large damage', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({
				characterOverrides: { name: 'Barbarian' },
			});
			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({ activeCharacter: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'gameplay',
				subcommand: 'damage',
				options: {
					[opts.targetCharacter]: 'Barbarian',
					[opts.damageAmount]: 100,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('Healing (Negative Damage)', () => {
		it('should respond when healing with negative damage', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({ characterOverrides: { name: 'Cleric' } });
			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({ activeCharacter: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'gameplay',
				subcommand: 'damage',
				options: {
					[opts.targetCharacter]: 'Cleric',
					[opts.damageAmount]: -20,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('Damage Types', () => {
		it('should respond when applying slashing damage', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({ characterOverrides: { name: 'Target' } });
			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({ activeCharacter: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'gameplay',
				subcommand: 'damage',
				options: {
					[opts.targetCharacter]: 'Target',
					[opts.damageAmount]: 8,
					[opts.damageType]: 'slashing',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should respond when applying cold damage', async () => {
			// Arrange
			const mockCharacter = createMockCharacter({ characterOverrides: { name: 'Target' } });
			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockResolvedValue({ activeCharacter: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'gameplay',
				subcommand: 'damage',
				options: {
					[opts.targetCharacter]: 'Target',
					[opts.damageAmount]: 12,
					[opts.damageType]: 'cold',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('Error Handling', () => {
		it('should respond with error when target not found', async () => {
			// Arrange
			const { fetchDataMock } = setupKoboldUtilsMocks();
			fetchDataMock.mockRejectedValue(new Error('Target not found'));

			// Act
			const result = await harness.executeCommand({
				commandName: 'gameplay',
				subcommand: 'damage',
				options: {
					[opts.targetCharacter]: 'NonexistentTarget',
					[opts.damageAmount]: 10,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});
});
