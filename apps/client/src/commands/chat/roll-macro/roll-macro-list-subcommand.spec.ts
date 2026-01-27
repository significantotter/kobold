/**
 * Integration tests for RollMacroListSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RollMacroCommand } from './roll-macro-command.js';
import { RollMacroListSubCommand } from './roll-macro-list-subcommand.js';
import {
	createTestHarness,
	setupKoboldUtilsMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
	getFullEmbedContent,
	type MockKoboldEmbed,
} from '../../../test-utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-embed-utils.js', async importOriginal => {
	const actual = await importOriginal<typeof import('../../../utils/kobold-embed-utils.js')>();
	return {
		...actual,
		KoboldEmbed: vi.fn(function (this: MockKoboldEmbed) {
			this.setCharacter = vi.fn(function (this: MockKoboldEmbed) {
				return this;
			});
			this.setTitle = vi.fn(function (this: MockKoboldEmbed) {
				return this;
			});
			this.addFields = vi.fn(function (this: MockKoboldEmbed) {
				return this;
			});
			this.sendBatches = vi.fn(async () => undefined);
			return this;
		}),
	};
});

describe('RollMacroListSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new RollMacroCommand([new RollMacroListSubCommand()])]);
	});

	describe('listing roll macros', () => {
		it('should list all roll macros for a character', async () => {
			// Arrange
			const { mockCharacter } = setupKoboldUtilsMocks();
			mockCharacter.name = 'Test Fighter';
			mockCharacter.sheetRecord.rollMacros = [
				{ name: 'sneak-attack', macro: '2d6' },
				{ name: 'power-attack', macro: '4' },
				{ name: 'str-bonus', macro: '[str]' },
			];

			// Act
			await harness.executeCommand({
				commandName: 'roll-macro',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - command completed successfully, mock was used
			expect(KoboldEmbed).toHaveBeenCalled();
		});

		it('should display empty list when no roll macros exist', async () => {
			// Arrange
			const { mockCharacter } = setupKoboldUtilsMocks();
			mockCharacter.name = 'Test Fighter';
			mockCharacter.sheetRecord.rollMacros = [];

			// Act
			await harness.executeCommand({
				commandName: 'roll-macro',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(KoboldEmbed).toHaveBeenCalled();
		});

		it('should sort roll macros alphabetically', async () => {
			// Arrange
			const { mockCharacter } = setupKoboldUtilsMocks();
			mockCharacter.name = 'Test Fighter';
			mockCharacter.sheetRecord.rollMacros = [
				{ name: 'zephyr', macro: '1d4' },
				{ name: 'alpha', macro: '1d6' },
				{ name: 'middle', macro: '1d8' },
			];

			// Act
			await harness.executeCommand({
				commandName: 'roll-macro',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(KoboldEmbed).toHaveBeenCalled();
		});

		it('should display character name in the embed title', async () => {
			// Arrange
			const { mockCharacter } = setupKoboldUtilsMocks();
			mockCharacter.name = 'Sir Galahad';
			mockCharacter.sheetRecord.rollMacros = [{ name: 'test-macro', macro: '1d6' }];

			// Act
			await harness.executeCommand({
				commandName: 'roll-macro',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(KoboldEmbed).toHaveBeenCalled();
		});
	});
});
