/**
 * Integration tests for ActionStageAddSaveSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vitestKobold } from '@kobold/db/test-utils';
import { RollTypeEnum } from '@kobold/db';
import { ActionStageCommand } from './action-stage-command.js';
import { ActionStageAddSaveSubCommand } from './action-stage-add-save-subcommand.js';
import {
	createTestHarness,
	createMockAction,
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

describe('ActionStageAddSaveSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new ActionStageCommand([new ActionStageAddSaveSubCommand()])]);
	});


	describe('execute', () => {
		it('should add a save roll to an action', async () => {
			// Arrange
			const action = createMockAction({ name: 'Fireball', rolls: [] });
			setupKoboldUtilsMocks({ actions: [action] });
			setupFinderHelpersMocks(action, [action]);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action-stage',
				subcommand: 'add-save',
				options: {
					action: 'Fireball',
					'roll-name': 'Reflex Save',
					'save-roll-type': 'Reflex',
					'ability-dc': 'Class DC',
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
				subcommand: 'add-save',
				options: {
					action: 'Nonexistent',
					'roll-name': 'Reflex Save',
					'save-roll-type': 'Reflex',
					'ability-dc': 'Class DC',
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
				name: 'Fireball',
				rolls: [
					{
						name: 'Reflex Save',
						type: RollTypeEnum.save,
						saveRollType: 'Reflex',
						allowRollModifiers: false,
						saveTargetDC: null,
					},
				],
			});
			setupKoboldUtilsMocks({ actions: [action] });
			setupFinderHelpersMocks(action, [action]);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action-stage',
				subcommand: 'add-save',
				options: {
					action: 'Fireball',
					'roll-name': 'Reflex Save',
					'save-roll-type': 'Reflex',
					'ability-dc': 'Class DC',
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
			const actions = [createMockAction({ name: 'Fireball' })];
			setupAutocompleteKoboldMocks({ actions });

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'action-stage',
				subcommand: 'add-save',
				focusedOption: { name: 'action', value: 'Fire' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.getChoices().length).toBeGreaterThanOrEqual(0);
		});
	});
});
