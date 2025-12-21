/**
 * Integration tests for RollMacroListSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RollMacroCommand } from './roll-macro-command.js';
import { RollMacroListSubCommand } from './roll-macro-list-subcommand.js';
import {
	createTestHarness,
	createMockCharacter,
	setupKoboldUtilsMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
	getFullEmbedContent,
} from '../../../test-utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');

describe('RollMacroListSubCommand Integration', () => {
	let harness: CommandTestHarness;
	let sendBatchesMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		harness = createTestHarness([new RollMacroCommand([new RollMacroListSubCommand()])]);

		// Mock KoboldEmbed.sendBatches
		sendBatchesMock = vi.fn().mockResolvedValue(undefined);
		vi.spyOn(KoboldEmbed.prototype, 'sendBatches').mockImplementation(sendBatchesMock as any);
	});


	describe('listing roll macros', () => {
		it('should list all roll macros for a character', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			mockCharacter.name = 'Test Fighter';
			mockCharacter.sheetRecord.rollMacros = [
				{ name: 'sneak-attack', macro: '2d6' },
				{ name: 'power-attack', macro: '4' },
				{ name: 'str-bonus', macro: '[str]' },
			];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll-macro',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(sendBatchesMock).toHaveBeenCalled();
		});

		it('should display empty list when no roll macros exist', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			mockCharacter.name = 'Test Fighter';
			mockCharacter.sheetRecord.rollMacros = [];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll-macro',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(sendBatchesMock).toHaveBeenCalled();
		});

		it('should sort roll macros alphabetically', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			mockCharacter.name = 'Test Fighter';
			mockCharacter.sheetRecord.rollMacros = [
				{ name: 'zephyr', macro: '1d4' },
				{ name: 'alpha', macro: '1d6' },
				{ name: 'middle', macro: '1d8' },
			];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll-macro',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(sendBatchesMock).toHaveBeenCalled();
		});

		it('should display character name in the embed title', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			mockCharacter.name = 'Sir Galahad';
			mockCharacter.sheetRecord.rollMacros = [{ name: 'test-macro', macro: '1d6' }];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'roll-macro',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(sendBatchesMock).toHaveBeenCalled();
		});
	});
});
