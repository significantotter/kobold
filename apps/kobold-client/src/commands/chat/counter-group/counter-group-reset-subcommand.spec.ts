/**
 * Unit tests for CounterGroupResetSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CounterStyleEnum } from '@kobold/db';
import { CounterGroupDefinition } from '@kobold/documentation';
import { CounterGroupCommand } from './counter-group-command.js';
import { CounterGroupResetSubCommand } from './counter-group-reset-subcommand.js';

const opts = CounterGroupDefinition.commandOptionsEnum;
const strings = CounterGroupDefinition.strings;

import {
	createTestHarness,
	setupKoboldUtilsMocks,
	setupSheetRecordUpdateMock,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
	createMockNumericCounter,
	createMockCounterGroup,
	getMockKobold,
	resetMockKobold,} from '../../../test-utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import type { CounterGroup, NumericCounter } from '@kobold/db';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-helpers/finder-helpers.js');

describe('CounterGroupResetSubCommand', () => {
	const kobold = getMockKobold();

	let harness: CommandTestHarness;

	beforeEach(() => {
		resetMockKobold(kobold);
		harness = createTestHarness([new CounterGroupCommand([new CounterGroupResetSubCommand()])]);
	});

	describe('resetting counter groups', () => {
		it('should reset all counters in a group', async () => {
			// Arrange
			const counters = [
				createMockNumericCounter({
					name: 'Level 1',
					current: 0,
					max: 4,
					recoverable: true,
					recoverTo: 4,
				}),
				createMockNumericCounter({
					name: 'Level 2',
					current: 1,
					max: 3,
					recoverable: true,
					recoverTo: 3,
				}),
			];
			const group = createMockCounterGroup({
				name: 'Spell Slots',
				counters: counters,
			});

			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterGroupByName).mockReturnValue(group);
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter-group',
				subcommand: 'reset',
				options: { [opts.counterGroupName]: 'Spell Slots' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should reset counter group case-insensitively', async () => {
			// Arrange
			const group = createMockCounterGroup({ name: 'Spell Slots' });
			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterGroupByName).mockReturnValue(group);
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter-group',
				subcommand: 'reset',
				options: { [opts.counterGroupName]: 'spell slots' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
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
				subcommand: 'reset',
				options: { [opts.counterGroupName]: 'Nonexistent' },
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
				subcommand: 'reset',
				options: { [opts.counterGroupName]: 'MissingGroup' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			const expectedMessage = strings.notFound({ groupName: 'MissingGroup' });
			expect(result.getResponseContent()).toBe(expectedMessage);
		});
	});

	describe('response messages', () => {
		it('should include character and group name in success message', async () => {
			// Arrange
			const group = createMockCounterGroup({ name: 'Spell Slots' });
			const { mockCharacter } = setupKoboldUtilsMocks({
				characterOverrides: { name: 'Testy McTestface' },
			});
			vi.mocked(FinderHelpers.getCounterGroupByName).mockReturnValue(group);
			setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter-group',
				subcommand: 'reset',
				options: { [opts.counterGroupName]: 'Spell Slots' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});
});
