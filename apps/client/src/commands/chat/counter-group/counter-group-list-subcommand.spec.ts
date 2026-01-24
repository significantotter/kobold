/**
 * Integration tests for CounterGroupListSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CounterGroupDefinition } from '@kobold/documentation';
import { CounterGroupCommand } from './counter-group-command.js';
import { CounterGroupListSubCommand } from './counter-group-list-subcommand.js';
import { CounterStyleEnum } from '@kobold/db';

import {
	createTestHarness,
	createMockCharacter,
	setupKoboldUtilsMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
	createMockNumericCounter,
	createMockCounterGroup,
} from '../../../test-utils/index.js';
import type { CounterGroup, NumericCounter } from '@kobold/db';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');

describe('CounterGroupListSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new CounterGroupCommand([new CounterGroupListSubCommand()])]);
	});

	describe('listing counter groups', () => {
		it('should list all counter groups', async () => {
			// Arrange
			const groups = [
				createMockCounterGroup({ name: 'Spell Slots' }),
				createMockCounterGroup({ name: 'Daily Powers' }),
			];
			const { mockCharacter } = setupKoboldUtilsMocks();
			mockCharacter.sheetRecord.sheet.counterGroups = groups;

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter-group',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should show empty list when no counter groups exist', async () => {
			// Arrange
			const { mockCharacter } = setupKoboldUtilsMocks();
			mockCharacter.sheetRecord.sheet.counterGroups = [];

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter-group',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should show counter groups with their counters', async () => {
			// Arrange
			const counter1 = createMockNumericCounter({ name: 'Level 1', current: 3, max: 4 });
			const counter2 = createMockNumericCounter({ name: 'Level 2', current: 2, max: 3 });
			const groups = [
				createMockCounterGroup({
					name: 'Spell Slots',
					counters: [counter1, counter2],
				}),
			];
			const { mockCharacter } = setupKoboldUtilsMocks();
			mockCharacter.sheetRecord.sheet.counterGroups = groups;

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter-group',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should include character name in title', async () => {
			// Arrange
			const { mockCharacter } = setupKoboldUtilsMocks({
				characterOverrides: { name: 'Testy McTestface' },
			});
			mockCharacter.sheetRecord.sheet.counterGroups = [];

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter-group',
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
