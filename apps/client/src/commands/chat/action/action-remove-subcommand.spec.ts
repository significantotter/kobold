/**
 * Integration tests for ActionRemoveSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActionCommand } from './action-command.js';
import { ActionRemoveSubCommand } from './action-remove-subcommand.js';
import {
	createTestHarness,
	createMockAction,
	setupKoboldUtilsMocks,
	setupAutocompleteKoboldMocks,
	setupFinderHelpersMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-helpers/finder-helpers.js');

describe('ActionRemoveSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new ActionCommand([new ActionRemoveSubCommand()])]);
	});


	describe('action removal flow', () => {
		it('should respond with not found when action does not exist', async () => {
			// Arrange
			setupKoboldUtilsMocks();
			setupFinderHelpersMocks(undefined);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action',
				subcommand: 'remove',
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
				createMockAction({ name: 'Strike' }),
				createMockAction({ name: 'Strong Strike' }),
			];

			setupAutocompleteKoboldMocks({ actions });
			setupFinderHelpersMocks(undefined, actions);

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'action',
				subcommand: 'remove',
				focusedOption: { name: 'action', value: 'Str' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.getChoices()).toHaveLength(2);
		});

		it('should return empty array when no character is active', async () => {
			// Arrange
			setupAutocompleteKoboldMocks({ noActiveCharacter: true });

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'action',
				subcommand: 'remove',
				focusedOption: { name: 'action', value: 'test' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.getChoices()).toHaveLength(0);
		});
	});
});
