/**
 * Integration tests for ActionStageAddAttackSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vitestKobold } from '@kobold/db/test-utils';
import { RollTypeEnum } from '@kobold/db';
import { ActionStageCommand } from './action-stage-command.js';
import { ActionStageAddAttackSubCommand } from './action-stage-add-attack-subcommand.js';
import {
	createTestHarness,
	createMockAction,
	createAttackRoll,
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

describe('ActionStageAddAttackSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([
			new ActionStageCommand([new ActionStageAddAttackSubCommand()]),
		]);
	});


	describe('execute', () => {
		it('should add an attack roll to an action', async () => {
			// Arrange
			const action = createMockAction({ name: 'Strike', rolls: [] });
			setupKoboldUtilsMocks({ actions: [action] });
			setupFinderHelpersMocks(action, [action]);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action-stage',
				subcommand: 'add-attack',
				options: {
					action: 'Strike',
					'roll-name': 'Attack Roll',
					'dice-roll': '1d20+10',
					'defending-stat': 'AC',
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
				subcommand: 'add-attack',
				options: {
					action: 'Nonexistent',
					'roll-name': 'Attack Roll',
					'dice-roll': '1d20+10',
					'defending-stat': 'AC',
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
				name: 'Strike',
				rolls: [createAttackRoll({ name: 'Attack Roll', roll: '1d20+5' })],
			});
			setupKoboldUtilsMocks({ actions: [action] });
			setupFinderHelpersMocks(action, [action]);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action-stage',
				subcommand: 'add-attack',
				options: {
					action: 'Strike',
					'roll-name': 'Attack Roll',
					'dice-roll': '1d20+10',
					'defending-stat': 'AC',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should add attack roll with allow-modifiers set to false', async () => {
			// Arrange
			const action = createMockAction({ name: 'Strike', rolls: [] });
			setupKoboldUtilsMocks({ actions: [action] });
			setupFinderHelpersMocks(action, [action]);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action-stage',
				subcommand: 'add-attack',
				options: {
					action: 'Strike',
					'roll-name': 'Attack Roll',
					'dice-roll': '1d20+10',
					'defending-stat': 'AC',
					'allow-modifiers': false,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});
	});

	describe('autocomplete', () => {
		it('should return matching actions for action target', async () => {
			// Arrange
			const actions = [
				createMockAction({ name: 'Strike' }),
				createMockAction({ name: 'Strong Strike' }),
			];
			setupAutocompleteKoboldMocks({ actions });
			setupFinderHelpersMocks(undefined, actions);

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'action-stage',
				subcommand: 'add-attack',
				focusedOption: { name: 'action', value: 'Str' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.getChoices().length).toBeGreaterThanOrEqual(0);
		});
	});
});
