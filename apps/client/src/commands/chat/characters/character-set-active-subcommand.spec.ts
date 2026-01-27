/**
 * Unit tests for CharacterSetActiveSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CharacterCommand } from './character-command.js';
import { CharacterSetActiveSubCommand } from './character-set-active-subcommand.js';
import {
	createTestHarness,
	createMockCharacter,
	setupCharacterUtilsMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
	getMockKobold,
	resetMockKobold,
} from '../../../test-utils/index.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');

describe('CharacterSetActiveSubCommand', () => {
	const kobold = getMockKobold();

	let harness: CommandTestHarness;

	beforeEach(() => {
		resetMockKobold(kobold);
		harness = createTestHarness([new CharacterCommand([new CharacterSetActiveSubCommand()])]);
	});

	describe('setting active character', () => {
		it('should set a character as active when it exists', async () => {
			// Arrange
			const targetCharacter = createMockCharacter({
				characterOverrides: { name: 'Target Character' },
			});

			setupCharacterUtilsMocks([targetCharacter]);

			const setIsActiveMock = kobold.character.setIsActive.mockResolvedValue(
				targetCharacter as any
			);

			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'set-active',
				options: { name: 'Target Character' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(setIsActiveMock).toHaveBeenCalledWith({
				id: targetCharacter.id,
				userId: TEST_USER_ID,
			});
		});

		it('should respond with not found when character does not exist', async () => {
			// Arrange
			setupCharacterUtilsMocks([]);

			const setIsActiveMock = kobold.character.setIsActive;

			// Act
			const result = await harness.executeCommand({
				commandName: 'character',
				subcommand: 'set-active',
				options: { name: 'Nonexistent Character' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(setIsActiveMock).not.toHaveBeenCalled();
		});
	});

	describe('autocomplete', () => {
		it('should return matching characters for autocomplete', async () => {
			// Arrange
			const characters = [
				createMockCharacter({ characterOverrides: { name: 'Fighter' } }),
				createMockCharacter({ characterOverrides: { name: 'Fire Wizard' } }),
			];

			setupCharacterUtilsMocks(characters);

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'character',
				subcommand: 'set-active',
				focusedOption: { name: 'name', value: 'Fi' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.getChoices()).toHaveLength(2);
			expect(result.getChoices().map(c => c.name)).toContain('Fighter');
			expect(result.getChoices().map(c => c.name)).toContain('Fire Wizard');
		});

		it('should return empty array when no characters match', async () => {
			// Arrange
			setupCharacterUtilsMocks([]);

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'character',
				subcommand: 'set-active',
				focusedOption: { name: 'name', value: 'nonexistent' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.getChoices()).toHaveLength(0);
		});
	});
});
