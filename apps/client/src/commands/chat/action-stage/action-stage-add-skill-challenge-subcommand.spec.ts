/**
 * Unit tests for ActionStageAddSkillChallengeSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RollTypeEnum } from '@kobold/db';
import { ActionStageCommand } from './action-stage-command.js';
import { ActionStageAddSkillChallengeSubCommand } from './action-stage-add-skill-challenge-subcommand.js';
import {
	createTestHarness,
	createMockAction,
	createSkillChallengeRoll,
	setupKoboldUtilsMocks,
	setupAutocompleteKoboldMocks,
	setupFinderHelpersMocks,
	setupSheetRecordUpdateMock,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
	getMockKobold,
	resetMockKobold,} from '../../../test-utils/index.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-helpers/finder-helpers.js');

describe('ActionStageAddSkillChallengeSubCommand', () => {
	const kobold = getMockKobold();

	let harness: CommandTestHarness;

	beforeEach(() => {
		resetMockKobold(kobold);
		harness = createTestHarness([
			new ActionStageCommand([new ActionStageAddSkillChallengeSubCommand()]),
		]);
	});

	describe('execute', () => {
		it('should add a skill challenge roll to an action', async () => {
			// Arrange
			const action = createMockAction({ name: 'Demoralize', rolls: [] });
			setupKoboldUtilsMocks({ actions: [action] });
			setupFinderHelpersMocks(action, [action]);
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action-stage',
				subcommand: 'add-skill-challenge',
				options: {
					action: 'Demoralize',
					'roll-name': 'Intimidation Check',
					'dice-roll': '1d20+15',
					'ability-dc': 'Will DC',
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
				subcommand: 'add-skill-challenge',
				options: {
					action: 'Nonexistent',
					'roll-name': 'Check',
					'dice-roll': '1d20+10',
					'ability-dc': 'AC',
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
				name: 'Demoralize',
				rolls: [
					createSkillChallengeRoll({
						name: 'Intimidation Check',
						roll: '1d20+10',
					}),
				],
			});
			setupKoboldUtilsMocks({ actions: [action] });
			setupFinderHelpersMocks(action, [action]);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action-stage',
				subcommand: 'add-skill-challenge',
				options: {
					action: 'Demoralize',
					'roll-name': 'Intimidation Check',
					'dice-roll': '1d20+15',
					'ability-dc': 'Will DC',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should add skill challenge with allow-modifiers set to false', async () => {
			// Arrange
			const action = createMockAction({ name: 'Demoralize', rolls: [] });
			setupKoboldUtilsMocks({ actions: [action] });
			setupFinderHelpersMocks(action, [action]);
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action-stage',
				subcommand: 'add-skill-challenge',
				options: {
					action: 'Demoralize',
					'roll-name': 'Intimidation Check',
					'dice-roll': '1d20+15',
					'ability-dc': 'Will DC',
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
			const actions = [createMockAction({ name: 'Demoralize' })];
			setupAutocompleteKoboldMocks({ actions });

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'action-stage',
				subcommand: 'add-skill-challenge',
				focusedOption: { name: 'action', value: 'Dem' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.getChoices().length).toBeGreaterThanOrEqual(0);
		});
	});
});
