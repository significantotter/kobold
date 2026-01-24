/**
 * Unit tests for ActionCreateSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActionCostChoices, ActionTypeChoices } from '@kobold/documentation';
import { ActionCommand } from './action-command.js';
import { ActionCreateSubCommand } from './action-create-subcommand.js';
import {
	createTestHarness,
	createMockAction,
	setupKoboldUtilsMocks,
	setupFinderHelpersMocks,
	setupSheetRecordUpdateMock,
	TEST_USER_ID,
	TEST_GUILD_ID,
	mockNethysDb,
	CommandTestHarness,
	getMockKobold,
	resetMockKobold,
} from '../../../test-utils/index.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-helpers/finder-helpers.js');

describe('ActionCreateSubCommand', () => {
	const kobold = getMockKobold();

	let harness: CommandTestHarness;

	beforeEach(() => {
		resetMockKobold(kobold);
		harness = createTestHarness([new ActionCommand([new ActionCreateSubCommand()])]);
	});

	describe('successful action creation', () => {
		it('should route through CommandHandler and create an action', async () => {
			// Arrange
			const { mockCharacter } = setupKoboldUtilsMocks();
			setupFinderHelpersMocks(undefined); // No existing action
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action',
				subcommand: 'create',
				options: {
					name: 'Fireball',
					'action-type': ActionTypeChoices.spell,
					actions: ActionCostChoices.two,
					description: 'A fiery blast',
					'base-level': 3,
					'auto-heighten': false,
					tags: 'fire,evocation',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should create action with minimal required options', async () => {
			// Arrange
			setupKoboldUtilsMocks();
			setupFinderHelpersMocks(undefined);
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action',
				subcommand: 'create',
				options: {
					name: 'Strike',
					'action-type': ActionTypeChoices.attack,
					actions: ActionCostChoices.one,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({
					actions: expect.arrayContaining([
						expect.objectContaining({
							name: 'Strike',
							type: ActionTypeChoices.attack,
							actionCost: ActionCostChoices.one,
							description: '',
						}),
					]),
				})
			);
		});
	});

	describe('error handling', () => {
		it('should not create action if name already exists', async () => {
			// Arrange
			const existingAction = createMockAction({ name: 'Existing Action' });
			setupKoboldUtilsMocks({ actions: [existingAction] });
			setupFinderHelpersMocks(existingAction);
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action',
				subcommand: 'create',
				options: {
					name: 'Existing Action',
					'action-type': ActionTypeChoices.attack,
					actions: ActionCostChoices.one,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).not.toHaveBeenCalled();
		});
	});

	describe('command routing verification', () => {
		it('should properly route to create subcommand via CommandHandler', async () => {
			// Arrange
			setupKoboldUtilsMocks();
			setupFinderHelpersMocks(undefined);
			setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action',
				subcommand: 'create',
				options: {
					name: 'Routing Test',
					'action-type': ActionTypeChoices.other,
					actions: ActionCostChoices.free,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(harness.getCommands()).toHaveLength(1);
			expect(harness.getCommands()[0].name).toBe('action');
		});

		it('should return registered commands through getCommands()', () => {
			const commands = harness.getCommands();
			expect(commands).toHaveLength(1);
			expect(commands[0]).toBeInstanceOf(ActionCommand);
		});

		it('should provide access to injected services', () => {
			const services = harness.getServices();
			expect(services.kobold).toBeDefined();
			expect(services.nethysCompendium).toBe(mockNethysDb);
		});
	});
});
