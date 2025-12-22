/**
 * Unit tests for ActionSetSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActionTypeEnum, ActionCostEnum } from '@kobold/db';
import { ActionCommand } from './action-command.js';
import { ActionSetSubCommand } from './action-set-subcommand.js';
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
	getMockKobold,
	resetMockKobold,} from '../../../test-utils/index.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-helpers/finder-helpers.js');

describe('ActionSetSubCommand', () => {
	const kobold = getMockKobold();

	let harness: CommandTestHarness;

	beforeEach(() => {
		resetMockKobold(kobold);
		harness = createTestHarness([new ActionCommand([new ActionSetSubCommand()])]);
	});

	describe('setting string fields', () => {
		it('should set action name', async () => {
			// Arrange
			const action = createMockAction({ name: 'Old Name', description: 'A test action' });

			setupKoboldUtilsMocks({ actions: [action] });
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action',
				subcommand: 'set',
				options: {
					action: 'Old Name',
					'set-option': 'name',
					'set-value': 'New Name',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should set action description', async () => {
			// Arrange
			const action = createMockAction({ name: 'Strike', description: 'Old description' });

			setupKoboldUtilsMocks({ actions: [action] });
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action',
				subcommand: 'set',
				options: {
					action: 'Strike',
					'set-option': 'description',
					'set-value': 'A powerful strike with great force',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});
	});

	describe('setting enum fields', () => {
		it('should set action type', async () => {
			// Arrange
			const action = createMockAction({
				name: 'Fireball',
				type: ActionTypeEnum.other,
				actionCost: ActionCostEnum.twoActions,
			});

			setupKoboldUtilsMocks({ actions: [action] });
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action',
				subcommand: 'set',
				options: {
					action: 'Fireball',
					'set-option': 'type',
					'set-value': 'spell',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should set action cost', async () => {
			// Arrange
			const action = createMockAction({ name: 'Quick Strike', description: 'A fast attack' });

			setupKoboldUtilsMocks({ actions: [action] });
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action',
				subcommand: 'set',
				options: {
					action: 'Quick Strike',
					'set-option': 'actionCost',
					'set-value': 'two',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});
	});

	describe('setting integer fields', () => {
		it('should set base level', async () => {
			// Arrange
			const action = createMockAction({
				name: 'Heal',
				type: ActionTypeEnum.spell,
				actionCost: ActionCostEnum.twoActions,
				baseLevel: 1,
				autoHeighten: true,
			});

			setupKoboldUtilsMocks({ actions: [action] });
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action',
				subcommand: 'set',
				options: {
					action: 'Heal',
					'set-option': 'baseLevel',
					'set-value': '3',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});
	});

	describe('setting array fields', () => {
		it('should set tags', async () => {
			// Arrange
			const action = createMockAction({
				name: 'Magic Missile',
				type: ActionTypeEnum.spell,
				baseLevel: 1,
			});

			setupKoboldUtilsMocks({ actions: [action] });
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action',
				subcommand: 'set',
				options: {
					action: 'Magic Missile',
					'set-option': 'tags',
					'set-value': 'force, evocation, cantrip',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});
	});

	describe('setting boolean fields', () => {
		it('should set autoHeighten to true', async () => {
			// Arrange
			const action = createMockAction({
				name: 'Fireball',
				type: ActionTypeEnum.spell,
				actionCost: ActionCostEnum.twoActions,
				baseLevel: 3,
				autoHeighten: false,
			});

			setupKoboldUtilsMocks({ actions: [action] });
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action',
				subcommand: 'set',
				options: {
					action: 'Fireball',
					'set-option': 'autoHeighten',
					'set-value': 'true',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should set autoHeighten to false', async () => {
			// Arrange
			const action = createMockAction({
				name: 'Heal',
				type: ActionTypeEnum.spell,
				actionCost: ActionCostEnum.twoActions,
				baseLevel: 1,
				autoHeighten: true,
			});

			setupKoboldUtilsMocks({ actions: [action] });
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action',
				subcommand: 'set',
				options: {
					action: 'Heal',
					'set-option': 'autoHeighten',
					'set-value': 'false',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});
	});

	describe('error handling', () => {
		it('should respond with not found when action does not exist', async () => {
			// Arrange
			setupKoboldUtilsMocks({ actions: [] });

			// Act
			const result = await harness.executeCommand({
				commandName: 'action',
				subcommand: 'set',
				options: {
					action: 'Nonexistent Action',
					'set-option': 'name',
					'set-value': 'New Name',
				},
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
				createMockAction({ name: 'Strike' }),
				createMockAction({ name: 'Strong Strike' }),
			];

			setupAutocompleteKoboldMocks({ actions });
			setupFinderHelpersMocks(undefined, actions);

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'action',
				subcommand: 'set',
				focusedOption: { name: 'action', value: 'Str' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.getChoices()).toHaveLength(2);
		});
	});
});
