/**
 * Integration tests for CounterGroupDisplaySubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CounterGroupDefinition } from '@kobold/documentation';
import { CounterGroupCommand } from './counter-group-command.js';
import { CounterGroupDisplaySubCommand } from './counter-group-display-subcommand.js';
import { CounterStyleEnum } from '@kobold/db';

const opts = CounterGroupDefinition.commandOptionsEnum;
const strings = CounterGroupDefinition.strings;

import {
	createTestHarness,
	setupKoboldUtilsMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
	createMockNumericCounter,
	createMockCounterGroup,
} from '../../../test-utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import type { CounterGroup, NumericCounter } from '@kobold/db';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-helpers/finder-helpers.js');

describe('CounterGroupDisplaySubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([
			new CounterGroupCommand([new CounterGroupDisplaySubCommand()]),
		]);
	});

	describe('displaying counter groups', () => {
		it('should display a counter group by name', async () => {
			// Arrange
			const group = createMockCounterGroup({ name: 'Spell Slots' });
			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterGroupByName).mockReturnValue(group);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter-group',
				subcommand: 'display',
				options: {
					[opts.counterGroupName]: 'Spell Slots',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should display counter group with its counters', async () => {
			// Arrange
			const counters = [
				createMockNumericCounter({ name: 'Level 1', current: 3, max: 4 }),
				createMockNumericCounter({ name: 'Level 2', current: 2, max: 3 }),
			];
			const group = createMockCounterGroup({
				name: 'Spell Slots',
				counters: counters,
			});
			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterGroupByName).mockReturnValue(group);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter-group',
				subcommand: 'display',
				options: {
					[opts.counterGroupName]: 'Spell Slots',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should display counter group with description', async () => {
			// Arrange
			const group = createMockCounterGroup({
				name: 'Daily Powers',
				description: 'Powers that reset on a long rest',
			});
			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterGroupByName).mockReturnValue(group);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter-group',
				subcommand: 'display',
				options: {
					[opts.counterGroupName]: 'Daily Powers',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('error handling', () => {
		it('should show error when counter group not found', async () => {
			// Arrange
			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterGroupByName).mockReturnValue(undefined);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter-group',
				subcommand: 'display',
				options: {
					[opts.counterGroupName]: 'Nonexistent',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - KoboldError is caught and responded to
			expect(result.didRespond()).toBe(true);
			expect(result.getResponseContent()).toContain("couldn't find");
		});

		it('should use documentation strings for not found error', async () => {
			// Arrange
			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterGroupByName).mockReturnValue(undefined);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter-group',
				subcommand: 'display',
				options: {
					[opts.counterGroupName]: 'MissingGroup',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			const expectedMessage = strings.notFound({ groupName: 'MissingGroup' });
			expect(result.getResponseContent()).toBe(expectedMessage);
		});
	});
});
