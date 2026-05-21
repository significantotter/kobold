import { describe, expect, beforeEach, it } from 'vitest';
import { ActionCommand } from './action-command.js';
import { ActionCopyImportedAttackSubCommand } from './action-copy-imported-attack-subcommand.js';
import {
	CommandTestHarness,
	TEST_GUILD_ID,
	TEST_USER_ID,
	createMockAction,
	createMockCharacter,
	createTestHarness,
	getMockKobold,
	resetMockKobold,
	setupActionModelMock,
} from '../../../test-utils/index.js';

describe('ActionCopyImportedAttackSubCommand', () => {
	const kobold = getMockKobold();
	let harness: CommandTestHarness;

	beforeEach(() => {
		resetMockKobold(kobold);
		harness = createTestHarness([
			new ActionCommand([new ActionCopyImportedAttackSubCommand()]),
		]);
	});

	it('autocompletes imported sheet attacks', async () => {
		const character = createMockCharacter();
		character.sheetRecord.sheet.attacks = [
			{
				name: 'Longsword',
				toHit: 12,
				damage: [],
				effects: [],
				range: null,
				traits: [],
				notes: null,
			},
			{
				name: 'Shortbow',
				toHit: 10,
				damage: [],
				effects: [],
				range: null,
				traits: [],
				notes: null,
			},
		];
		kobold.character.readActiveAdjusted.mockResolvedValue(character);

		const result = await harness.executeAutocomplete({
			commandName: 'action',
			subcommand: 'copy-imported-attack',
			options: { attack: 'long' },
			focusedOption: { name: 'attack', value: 'long' },
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		expect(result.getChoices()).toEqual([{ name: 'Longsword', value: 'Longsword' }]);
	});

	it('copies an imported attack into a character-local action', async () => {
		const character = createMockCharacter();
		character.sheetRecord.sheet.attacks = [
			{
				name: 'Longsword',
				toHit: 12,
				damage: [
					{
						dice: '1d8+4',
						type: 'slashing',
						tags: [],
						mode: 'damage',
						persistent: false,
					},
				],
				effects: [],
				range: null,
				traits: [],
				notes: null,
			},
		];
		character.actions = [];
		kobold.character.readActiveAdjusted.mockResolvedValue(character);
		const { createMock } = setupActionModelMock(kobold);

		const result = await harness.executeCommand({
			commandName: 'action',
			subcommand: 'copy-imported-attack',
			options: { attack: 'Longsword', name: 'My Longsword' },
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		expect(result.getResponseContent()).toBe(
			'Created custom action "My Longsword" from imported attack "Longsword". Future imports will update the imported Longsword action, but not this custom copy.'
		);
		expect(createMock).toHaveBeenCalledWith(
			expect.objectContaining({
				userId: TEST_USER_ID,
				sheetRecordId: character.sheetRecordId,
				name: 'My Longsword',
				rolls: expect.any(Array),
			})
		);
	});

	it('chooses copy names predictably for name collisions', async () => {
		const character = createMockCharacter({
			actions: [
				createMockAction({ name: 'Longsword' }),
				createMockAction({ name: 'Longsword Copy' }),
			],
		});
		character.sheetRecord.sheet.attacks = [
			{
				name: 'Longsword',
				toHit: 12,
				damage: [],
				effects: [],
				range: null,
				traits: [],
				notes: null,
			},
		];
		kobold.character.readActiveAdjusted.mockResolvedValue(character);
		const { createMock } = setupActionModelMock(kobold);

		await harness.executeCommand({
			commandName: 'action',
			subcommand: 'copy-imported-attack',
			options: { attack: 'Longsword' },
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		expect(createMock).toHaveBeenCalledWith(expect.objectContaining({ name: 'Longsword Copy 2' }));
	});
});
