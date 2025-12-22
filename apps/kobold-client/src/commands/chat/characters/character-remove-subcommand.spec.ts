/**
 * Unit tests for CharacterRemoveSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CharacterCommand } from './character-command.js';
import { CharacterRemoveSubCommand } from './character-remove-subcommand.js';
import {
	createTestHarness,
	createMockCharacter,
	setupKoboldUtilsMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
	getMockKobold,
	resetMockKobold,
} from '../../../test-utils/index.js';
import { CollectorUtils } from '../../../utils/collector-utils.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/collector-utils.js');

describe('CharacterRemoveSubCommand', () => {
	const kobold = getMockKobold();

	let harness: CommandTestHarness;

	beforeEach(() => {
		resetMockKobold(kobold);
		harness = createTestHarness([new CharacterCommand([new CharacterRemoveSubCommand()])]);
	});

	describe('character removal flow', () => {
		it('should prompt for confirmation before removing', async () => {
			// Arrange
			setupKoboldUtilsMocks();

			// Mock button collector to simulate user cancelling
			vi.mocked(CollectorUtils.collectByButton).mockResolvedValue({
				intr: { user: { id: TEST_USER_ID } } as any,
				value: 'cancel',
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'remove',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should remove character when user confirms', async () => {
			// Arrange
			const { mockCharacter } = setupKoboldUtilsMocks();
			const deleteMock = kobold.character.delete.mockResolvedValue(undefined);
			kobold.character.read.mockResolvedValue(null);

			// Mock button collector to simulate user confirming removal
			vi.mocked(CollectorUtils.collectByButton).mockResolvedValue({
				intr: { user: { id: TEST_USER_ID } } as any,
				value: 'remove',
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'remove',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(deleteMock).toHaveBeenCalledWith({ id: mockCharacter.id });
		});

		it('should not delete when user cancels', async () => {
			// Arrange
			setupKoboldUtilsMocks();
			const deleteMock = kobold.character.delete.mockResolvedValue(undefined);

			// Mock button collector to simulate user cancelling
			vi.mocked(CollectorUtils.collectByButton).mockResolvedValue({
				intr: { user: { id: TEST_USER_ID } } as any,
				value: 'cancel',
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'remove',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(deleteMock).not.toHaveBeenCalled();
		});

		it('should handle confirmation timeout', async () => {
			// Arrange
			setupKoboldUtilsMocks();
			const deleteMock = kobold.character.delete.mockResolvedValue(undefined);

			// Mock button collector to simulate timeout (returns undefined)
			vi.mocked(CollectorUtils.collectByButton).mockResolvedValue(undefined);

			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'remove',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(deleteMock).not.toHaveBeenCalled();
		});

		it('should set a new active character after removal', async () => {
			// Arrange
			setupKoboldUtilsMocks();
			const newCharacter = createMockCharacter({
				characterOverrides: { name: 'New Active', id: 123456 },
			});

			kobold.character.delete.mockResolvedValue(undefined);
			kobold.character.read.mockResolvedValue(newCharacter as any);
			const setIsActiveMock = kobold.character.setIsActive.mockResolvedValue(
				newCharacter as any
			);

			// Mock button collector to simulate user confirming removal
			vi.mocked(CollectorUtils.collectByButton).mockResolvedValue({
				intr: { user: { id: TEST_USER_ID } } as any,
				value: 'remove',
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'remove',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(setIsActiveMock).toHaveBeenCalledWith({
				id: newCharacter.id,
				userId: TEST_USER_ID,
			});
		});
	});
});
