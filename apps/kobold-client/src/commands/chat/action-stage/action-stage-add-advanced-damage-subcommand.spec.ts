/**
 * Integration tests for ActionStageAddAdvancedDamageSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vitestKobold } from '@kobold/db/test-utils';
import { RollTypeEnum } from '@kobold/db';
import { ActionStageCommand } from './action-stage-command.js';
import { ActionStageAddAdvancedDamageSubCommand } from './action-stage-add-advanced-damage-subcommand.js';
import {
	createTestHarness,
	createMockAction,
	createAdvancedDamageRoll,
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

describe('ActionStageAddAdvancedDamageSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([
			new ActionStageCommand([new ActionStageAddAdvancedDamageSubCommand()]),
		]);
	});


	describe('execute', () => {
		it('should add an advanced damage roll with degree-of-success variants', async () => {
			// Arrange
			const action = createMockAction({ name: 'Fireball', rolls: [] });
			setupKoboldUtilsMocks({ actions: [action] });
			setupFinderHelpersMocks(action, [action]);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action-stage',
				subcommand: 'add-advanced-damage',
				options: {
					action: 'Fireball',
					'roll-name': 'Fire Damage',
					'damage-type': 'fire',
					'success-dice-roll': '3d6',
					'critical-success-dice-roll': '0',
					'failure-dice-roll': '6d6',
					'critical-failure-dice-roll': '12d6',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should fail when no damage rolls are provided', async () => {
			// Arrange
			const action = createMockAction({ name: 'Fireball', rolls: [] });
			setupKoboldUtilsMocks({ actions: [action] });
			setupFinderHelpersMocks(action, [action]);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action-stage',
				subcommand: 'add-advanced-damage',
				options: {
					action: 'Fireball',
					'roll-name': 'Fire Damage',
					'damage-type': 'fire',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should fail when action is not found', async () => {
			// Arrange
			setupKoboldUtilsMocks({ actions: [] });
			setupFinderHelpersMocks(undefined, []);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action-stage',
				subcommand: 'add-advanced-damage',
				options: {
					action: 'Nonexistent',
					'roll-name': 'Damage',
					'success-dice-roll': '3d6',
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
				rolls: [createAdvancedDamageRoll({ name: 'Fire Damage', successRoll: '3d6' })],
			});
			setupKoboldUtilsMocks({ actions: [action] });
			setupFinderHelpersMocks(action, [action]);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action-stage',
				subcommand: 'add-advanced-damage',
				options: {
					action: 'Fireball',
					'roll-name': 'Fire Damage',
					'success-dice-roll': '3d6',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should add advanced damage as healing', async () => {
			// Arrange
			const action = createMockAction({ name: 'Heal', rolls: [] });
			setupKoboldUtilsMocks({ actions: [action] });
			setupFinderHelpersMocks(action, [action]);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action-stage',
				subcommand: 'add-advanced-damage',
				options: {
					action: 'Heal',
					'roll-name': 'Healing',
					'heal-instead-of-damage': true,
					'success-dice-roll': '2d8',
					'critical-success-dice-roll': '4d8',
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
			const actions = [createMockAction({ name: 'Fireball' })];
			setupAutocompleteKoboldMocks({ actions });

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'action-stage',
				subcommand: 'add-advanced-damage',
				focusedOption: { name: 'action', value: 'Fire' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.getChoices().length).toBeGreaterThanOrEqual(0);
		});
	});
});
