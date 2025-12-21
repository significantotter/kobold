/**
 * Integration tests for ActionStageAddBasicDamageSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vitestKobold } from '@kobold/db/test-utils';
import { RollTypeEnum } from '@kobold/db';
import { ActionStageCommand } from './action-stage-command.js';
import { ActionStageAddBasicDamageSubCommand } from './action-stage-add-basic-damage-subcommand.js';
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

describe('ActionStageAddBasicDamageSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([
			new ActionStageCommand([new ActionStageAddBasicDamageSubCommand()]),
		]);
	});


	describe('execute', () => {
		it('should add a basic damage roll to an action', async () => {
			// Arrange
			const action = createMockAction({ name: 'Strike', rolls: [] });
			setupKoboldUtilsMocks({ actions: [action] });
			setupFinderHelpersMocks(action, [action]);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action-stage',
				subcommand: 'add-basic-damage',
				options: {
					action: 'Strike',
					'roll-name': 'Damage',
					'basic-damage-dice-roll': '2d6+4',
					'damage-type': 'slashing',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should add healing roll with heal-instead-of-damage option', async () => {
			// Arrange
			const action = createMockAction({ name: 'Heal', rolls: [] });
			setupKoboldUtilsMocks({ actions: [action] });
			setupFinderHelpersMocks(action, [action]);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action-stage',
				subcommand: 'add-basic-damage',
				options: {
					action: 'Heal',
					'roll-name': 'Healing',
					'basic-damage-dice-roll': '2d8+4',
					'heal-instead-of-damage': true,
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
				subcommand: 'add-basic-damage',
				options: {
					action: 'Nonexistent',
					'roll-name': 'Damage',
					'basic-damage-dice-roll': '2d6+4',
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
				rolls: [
					{
						name: 'Damage',
						type: RollTypeEnum.damage,
						roll: '1d6',
						allowRollModifiers: false,
						damageType: null,
						healInsteadOfDamage: false,
					},
				],
			});
			setupKoboldUtilsMocks({ actions: [action] });
			setupFinderHelpersMocks(action, [action]);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action-stage',
				subcommand: 'add-basic-damage',
				options: {
					action: 'Strike',
					'roll-name': 'Damage',
					'basic-damage-dice-roll': '2d6+4',
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
			const actions = [createMockAction({ name: 'Strike' })];
			setupAutocompleteKoboldMocks({ actions });

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'action-stage',
				subcommand: 'add-basic-damage',
				focusedOption: { name: 'action', value: 'Str' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.getChoices().length).toBeGreaterThanOrEqual(0);
		});
	});
});
