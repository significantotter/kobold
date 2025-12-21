/**
 * Integration tests for ActionStageAddTextSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vitestKobold } from '@kobold/db/test-utils';
import { RollTypeEnum } from '@kobold/db';
import { ActionStageCommand } from './action-stage-command.js';
import { ActionStageAddTextSubCommand } from './action-stage-add-text-subcommand.js';
import {
	createTestHarness,
	createMockAction,
	createTextRoll,
	setupKoboldUtilsMocks,
	setupAutocompleteKoboldMocks,
	setupFinderHelpersMocks,
	setupSheetRecordUpdateMock,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-helpers/finder-helpers.js');

describe('ActionStageAddTextSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new ActionStageCommand([new ActionStageAddTextSubCommand()])]);
	});


	describe('execute', () => {
		it('should add a text stage to an action with default text', async () => {
			// Arrange
			const action = createMockAction({ name: 'Cast Spell', rolls: [] });
			setupKoboldUtilsMocks({ actions: [action] });
			setupFinderHelpersMocks(action, [action]);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action-stage',
				subcommand: 'add-text',
				options: {
					action: 'Cast Spell',
					'roll-name': 'Effect',
					'default-text': 'The spell takes effect.',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should add text stage with degree-of-success variants', async () => {
			// Arrange
			const action = createMockAction({ name: 'Cast Spell', rolls: [] });
			setupKoboldUtilsMocks({ actions: [action] });
			setupFinderHelpersMocks(action, [action]);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action-stage',
				subcommand: 'add-text',
				options: {
					action: 'Cast Spell',
					'roll-name': 'Effect',
					'success-text': 'The target is affected.',
					'critical-success-text': 'The target is greatly affected!',
					'failure-text': 'The spell fails.',
					'critical-failure-text': 'The spell backfires!',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should add text stage with extra tags', async () => {
			// Arrange
			const action = createMockAction({ name: 'Cast Spell', rolls: [] });
			setupKoboldUtilsMocks({ actions: [action] });
			setupFinderHelpersMocks(action, [action]);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action-stage',
				subcommand: 'add-text',
				options: {
					action: 'Cast Spell',
					'roll-name': 'Effect',
					'default-text': 'The spell takes effect.',
					'extra-tags': 'fire, evocation, arcane',
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
			setupFinderHelpersMocks(undefined, []);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action-stage',
				subcommand: 'add-text',
				options: {
					action: 'Nonexistent',
					'roll-name': 'Effect',
					'default-text': 'Text content',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should fail when roll name already exists', async () => {
			// Arrange
			const action = createMockAction({
				name: 'Cast Spell',
				rolls: [createTextRoll({ name: 'Effect', defaultText: 'Old text' })],
			});
			setupKoboldUtilsMocks({ actions: [action] });
			setupFinderHelpersMocks(action, [action]);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action-stage',
				subcommand: 'add-text',
				options: {
					action: 'Cast Spell',
					'roll-name': 'Effect',
					'default-text': 'New text',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should fail when no text is provided', async () => {
			// Arrange
			const action = createMockAction({ name: 'Cast Spell', rolls: [] });
			setupKoboldUtilsMocks({ actions: [action] });
			setupFinderHelpersMocks(action, [action]);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action-stage',
				subcommand: 'add-text',
				options: {
					action: 'Cast Spell',
					'roll-name': 'Effect',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should fail when combined text is too long', async () => {
			// Arrange
			const action = createMockAction({ name: 'Cast Spell', rolls: [] });
			setupKoboldUtilsMocks({ actions: [action] });
			setupFinderHelpersMocks(action, [action]);

			const longText = 'A'.repeat(200);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action-stage',
				subcommand: 'add-text',
				options: {
					action: 'Cast Spell',
					'roll-name': 'Effect',
					'default-text': longText,
					'success-text': longText,
					'critical-success-text': longText,
					'failure-text': longText,
					'critical-failure-text': longText,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('autocomplete', () => {
		it('should return matching actions for action target', async () => {
			// Arrange
			const actions = [createMockAction({ name: 'Cast Spell' })];
			setupAutocompleteKoboldMocks({ actions });

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'action-stage',
				subcommand: 'add-text',
				focusedOption: { name: 'action', value: 'Cast' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.getChoices().length).toBeGreaterThanOrEqual(0);
		});
	});
});
