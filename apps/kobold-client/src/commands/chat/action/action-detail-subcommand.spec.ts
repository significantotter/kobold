/**
 * Integration tests for ActionDetailSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActionTypeEnum, ActionCostEnum } from '@kobold/db';
import { ActionCommand } from './action-command.js';
import { ActionDetailSubCommand } from './action-detail-subcommand.js';
import {
	createTestHarness,
	createMockAction,
	createAttackRoll,
	createDamageRoll,
	setupKoboldUtilsMocks,
	setupAutocompleteKoboldMocks,
	setupFinderHelpersMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-helpers/finder-helpers.js');

describe('ActionDetailSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new ActionCommand([new ActionDetailSubCommand()])]);
	});


	describe('successful action detail retrieval', () => {
		it('should display details for an existing action', async () => {
			// Arrange
			const action = createMockAction({
				name: 'Fireball',
				description: 'A powerful fire spell',
				type: ActionTypeEnum.spell,
				actionCost: ActionCostEnum.twoActions,
				baseLevel: 3,
				autoHeighten: true,
				tags: ['fire', 'evocation'],
			});

			const { mockCharacter } = setupKoboldUtilsMocks({ actions: [action] });
			setupFinderHelpersMocks(action);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action',
				subcommand: 'detail',
				options: { action: 'Fireball' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should display action with various roll types', async () => {
			// Arrange
			const action = createMockAction({
				name: 'Complex Attack',
				description: 'An attack with multiple rolls',
				type: ActionTypeEnum.attack,
				rolls: [
					createAttackRoll({ name: 'Attack Roll', roll: '1d20+10', targetDC: 'AC' }),
					createDamageRoll({
						name: 'Damage',
						roll: '2d6+4',
						damageType: 'slashing',
						healInsteadOfDamage: false,
					}),
				],
				tags: ['melee'],
			});

			setupKoboldUtilsMocks({ actions: [action] });
			setupFinderHelpersMocks(action);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action',
				subcommand: 'detail',
				options: { action: 'Complex Attack' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('error handling', () => {
		it('should respond with not found when action does not exist', async () => {
			// Arrange
			setupKoboldUtilsMocks();
			setupFinderHelpersMocks(undefined);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action',
				subcommand: 'detail',
				options: { action: 'Nonexistent Action' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('autocomplete', () => {
		it('should return matching actions for autocomplete', async () => {
			// Arrange
			const actions = [
				createMockAction({ name: 'Fireball' }),
				createMockAction({ name: 'Fire Bolt' }),
			];

			setupAutocompleteKoboldMocks({ actions });
			setupFinderHelpersMocks(undefined, actions);

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'action',
				subcommand: 'detail',
				focusedOption: { name: 'action', value: 'Fire' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.getChoices()).toHaveLength(2);
		});
	});
});
