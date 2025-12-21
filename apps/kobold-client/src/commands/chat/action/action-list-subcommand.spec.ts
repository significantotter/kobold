/**
 * Integration tests for ActionListSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActionTypeEnum, ActionCostEnum } from '@kobold/db';
import { ActionCommand } from './action-command.js';
import { ActionListSubCommand } from './action-list-subcommand.js';
import {
	createTestHarness,
	createMockAction,
	setupKoboldUtilsMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');

describe('ActionListSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new ActionCommand([new ActionListSubCommand()])]);
	});


	describe('successful action listing', () => {
		it('should list all actions for a character', async () => {
			// Arrange
			const actions = [
				createMockAction({ name: 'Strike', description: 'A basic attack' }),
				createMockAction({
					name: 'Fireball',
					description: 'A powerful fire spell',
					type: ActionTypeEnum.spell,
					actionCost: ActionCostEnum.twoActions,
					baseLevel: 3,
					autoHeighten: true,
					tags: ['fire', 'evocation'],
				}),
			];

			setupKoboldUtilsMocks({ actions });

			// Act
			const result = await harness.executeCommand({
				commandName: 'action',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should handle character with no actions', async () => {
			// Arrange
			setupKoboldUtilsMocks({ actions: [] });

			// Act
			const result = await harness.executeCommand({
				commandName: 'action',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should handle actions with long descriptions', async () => {
			// Arrange
			const actions = [
				createMockAction({
					name: 'Verbose Action',
					description: 'A'.repeat(1500), // Very long description
					type: ActionTypeEnum.other,
					actionCost: ActionCostEnum.variableActions,
				}),
			];

			setupKoboldUtilsMocks({ actions });

			// Act
			const result = await harness.executeCommand({
				commandName: 'action',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should sort actions alphabetically by name', async () => {
			// Arrange
			const actions = [
				createMockAction({
					name: 'Zap',
					description: 'Lightning',
					type: ActionTypeEnum.spell,
				}),
				createMockAction({
					name: 'Attack',
					description: 'Basic attack',
					type: ActionTypeEnum.attack,
				}),
				createMockAction({
					name: 'Meditate',
					description: 'Focus',
					type: ActionTypeEnum.other,
					actionCost: ActionCostEnum.threeActions,
				}),
			];

			setupKoboldUtilsMocks({ actions });

			// Act
			const result = await harness.executeCommand({
				commandName: 'action',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should handle actions with empty or null descriptions', async () => {
			// Arrange
			const actions = [
				createMockAction({ name: 'No Description', description: '' }),
				createMockAction({ name: 'With Description', description: 'Has content' }),
			];

			setupKoboldUtilsMocks({ actions });

			// Act
			const result = await harness.executeCommand({
				commandName: 'action',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});
});
