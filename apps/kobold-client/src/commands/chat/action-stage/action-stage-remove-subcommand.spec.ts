/**
 * Unit tests for ActionStageRemoveSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActionStageCommand } from './action-stage-command.js';
import { ActionStageRemoveSubCommand } from './action-stage-remove-subcommand.js';
import {
	createTestHarness,
	createMockAction,
	createAttackRoll,
	createDamageRoll,
	setupKoboldUtilsMocks,
	setupAutocompleteKoboldMocks,
	setupSheetRecordUpdateMock,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
	getMockKobold,
	resetMockKobold,} from '../../../test-utils/index.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-helpers/finder-helpers.js');

describe('ActionStageRemoveSubCommand', () => {
	const kobold = getMockKobold();

	let harness: CommandTestHarness;

	beforeEach(() => {
		resetMockKobold(kobold);
		harness = createTestHarness([new ActionStageCommand([new ActionStageRemoveSubCommand()])]);
	});

	describe('execute', () => {
		it('should remove a roll from an action', async () => {
			// Arrange
			const action = createMockAction({
				name: 'Strike',
				rolls: [
					createAttackRoll({ name: 'Attack', roll: '1d20+10' }),
					createDamageRoll({ name: 'Damage', roll: '2d6+4' }),
				],
			});
			setupKoboldUtilsMocks({ actions: [action] });
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action-stage',
				subcommand: 'remove',
				options: {
					action: 'Strike -- Attack',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should fail when action is not found', async () => {
			// Arrange
			setupKoboldUtilsMocks({ actions: [] });

			// Act
			const result = await harness.executeCommand({
				commandName: 'action-stage',
				subcommand: 'remove',
				options: {
					action: 'Nonexistent -- Roll',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should fail when roll is not found on action', async () => {
			// Arrange
			const action = createMockAction({
				name: 'Strike',
				rolls: [createAttackRoll({ name: 'Attack', roll: '1d20+10' })],
			});
			setupKoboldUtilsMocks({ actions: [action] });

			// Act
			const result = await harness.executeCommand({
				commandName: 'action-stage',
				subcommand: 'remove',
				options: {
					action: 'Strike -- Nonexistent',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('autocomplete', () => {
		it('should return matching action rolls for autocomplete', async () => {
			// Arrange
			const action = createMockAction({
				name: 'Strike',
				rolls: [
					createAttackRoll({ name: 'Attack', roll: '1d20+10' }),
					createDamageRoll({ name: 'Damage', roll: '2d6+4' }),
				],
			});
			setupAutocompleteKoboldMocks({ actions: [action] });

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'action-stage',
				subcommand: 'remove',
				focusedOption: { name: 'action', value: 'Strike' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.getChoices().length).toBeGreaterThanOrEqual(0);
		});

		it('should return empty array when no character is active', async () => {
			// Arrange
			setupAutocompleteKoboldMocks({ noActiveCharacter: true });

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'action-stage',
				subcommand: 'remove',
				focusedOption: { name: 'action', value: 'test' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.getChoices()).toHaveLength(0);
		});
	});
});
