import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CharacterCommand } from './character-command.js';
import { CharacterRenameSubCommand } from './character-rename-subcommand.js';
import {
	createTestHarness,
	createMockCharacter,
	setupCharacterUtilsMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	TEST_CHANNEL_ID,
	CommandTestHarness,
	getMockKobold,
	resetMockKobold,
} from '../../../test-utils/index.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');

describe('CharacterRenameSubCommand', () => {
	const kobold = getMockKobold();

	let harness: CommandTestHarness;

	beforeEach(() => {
		resetMockKobold(kobold);
		harness = createTestHarness([new CharacterCommand([new CharacterRenameSubCommand()])]);
	});

	it('renames the active character when no target name is provided', async () => {
		const activeCharacter = createMockCharacter({
			characterOverrides: { id: 10, name: 'Primary Hero' },
		});
		kobold.character.readActiveLite.mockResolvedValue(activeCharacter);
		kobold.character.readLite.mockResolvedValue(null);
		kobold.character.updateName.mockResolvedValue(undefined);

		const result = await harness.executeCommand({
			commandName: 'character',
			subcommand: 'rename',
			options: { 'new-name': 'Primary Hero Prime' },
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
			channelId: TEST_CHANNEL_ID,
		});

		expect(result.getResponseContent()).toContain(
			"I've renamed Primary Hero to Primary Hero Prime"
		);
		expect(kobold.character.updateName).toHaveBeenCalledWith({
			id: activeCharacter.id,
			userId: TEST_USER_ID,
			name: 'Primary Hero Prime',
		});
	});

	it('renames a character selected by name', async () => {
		const targetCharacter = createMockCharacter({
			characterOverrides: { id: 11, name: 'Side Hero' },
		});
		setupCharacterUtilsMocks([targetCharacter]);
		kobold.character.readLite.mockResolvedValue(null);
		kobold.character.updateName.mockResolvedValue(undefined);

		const result = await harness.executeCommand({
			commandName: 'character',
			subcommand: 'rename',
			options: { name: 'Side Hero', 'new-name': 'Side Hero Prime' },
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		expect(result.getResponseContent()).toContain(
			"I've renamed Side Hero to Side Hero Prime"
		);
		expect(kobold.character.readActiveLite).not.toHaveBeenCalled();
		expect(kobold.character.updateName).toHaveBeenCalledWith({
			id: targetCharacter.id,
			userId: TEST_USER_ID,
			name: 'Side Hero Prime',
		});
	});

	it('rejects a new name that already belongs to another character', async () => {
		const activeCharacter = createMockCharacter({
			characterOverrides: { id: 10, name: 'Primary Hero' },
		});
		const existingCharacter = createMockCharacter({
			characterOverrides: { id: 12, name: 'Taken Name' },
		});
		kobold.character.readActiveLite.mockResolvedValue(activeCharacter);
		kobold.character.readLite.mockResolvedValue(existingCharacter);

		const result = await harness.executeCommand({
			commandName: 'character',
			subcommand: 'rename',
			options: { 'new-name': 'Taken Name' },
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		expect(result.getResponseContent()).toContain(
			'You already have a character named Taken Name'
		);
		expect(kobold.character.updateName).not.toHaveBeenCalled();
	});

	it('responds with not found when the selected character does not exist', async () => {
		setupCharacterUtilsMocks([]);

		const result = await harness.executeCommand({
			commandName: 'character',
			subcommand: 'rename',
			options: { name: 'Missing Hero', 'new-name': 'New Hero' },
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		expect(result.getResponseContent()).toContain("couldn't find a character");
		expect(kobold.character.updateName).not.toHaveBeenCalled();
	});

	it('trims the new name before saving', async () => {
		const activeCharacter = createMockCharacter({
			characterOverrides: { id: 10, name: 'Primary Hero' },
		});
		kobold.character.readActiveLite.mockResolvedValue(activeCharacter);
		kobold.character.readLite.mockResolvedValue(null);
		kobold.character.updateName.mockResolvedValue(undefined);

		await harness.executeCommand({
			commandName: 'character',
			subcommand: 'rename',
			options: { 'new-name': '  Primary Hero Prime  ' },
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		expect(kobold.character.updateName).toHaveBeenCalledWith({
			id: activeCharacter.id,
			userId: TEST_USER_ID,
			name: 'Primary Hero Prime',
		});
	});

	it('returns matching characters for autocomplete', async () => {
		const characters = [
			createMockCharacter({ characterOverrides: { name: 'Fighter' } }),
			createMockCharacter({ characterOverrides: { name: 'Fire Wizard' } }),
		];
		setupCharacterUtilsMocks(characters);

		const result = await harness.executeAutocomplete({
			commandName: 'character',
			subcommand: 'rename',
			focusedOption: { name: 'name', value: 'Fi' },
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		expect(result.getChoices()).toHaveLength(2);
		expect(result.getChoices().map(c => c.name)).toContain('Fighter');
		expect(result.getChoices().map(c => c.name)).toContain('Fire Wizard');
	});
});
