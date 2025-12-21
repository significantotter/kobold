/**
 * Integration tests for CounterGroupSetSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vitestKobold } from '@kobold/db/test-utils';
import { CounterStyleEnum } from '@kobold/db';
import { CounterGroupDefinition } from '@kobold/documentation';
import { CounterGroupCommand } from './counter-group-command.js';
import { CounterGroupSetSubCommand } from './counter-group-set-subcommand.js';

const opts = CounterGroupDefinition.commandOptionsEnum;
const strings = CounterGroupDefinition.strings;
const optionChoices = CounterGroupDefinition.optionChoices;

import {
	createTestHarness,
	setupKoboldUtilsMocks,
	setupSheetRecordUpdateMock,
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

describe('CounterGroupSetSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new CounterGroupCommand([new CounterGroupSetSubCommand()])]);
	});

	describe('setting counter group name', () => {
		it('should set a new name for the counter group', async () => {
			// Arrange
			const group = createMockCounterGroup({ name: 'Spell Slots' });
			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterGroupByName).mockReturnValue(group);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter-group',
				subcommand: 'set',
				options: {
					[opts.counterGroupName]: 'Spell Slots',
					[opts.counterGroupSetOption]: optionChoices.setOption.name,
					[opts.counterGroupSetValue]: 'Daily Spells',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
			expect(group.name).toBe('Daily Spells');
		});

		it('should reject name that is too long', async () => {
			// Arrange
			const group = createMockCounterGroup({ name: 'Spell Slots' });
			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterGroupByName).mockReturnValue(group);

			const longName = 'A'.repeat(51);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter-group',
				subcommand: 'set',
				options: {
					[opts.counterGroupName]: 'Spell Slots',
					[opts.counterGroupSetOption]: optionChoices.setOption.name,
					[opts.counterGroupSetValue]: longName,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - KoboldError is caught and responded to
			expect(result.didRespond()).toBe(true);
			expect(result.getResponseContent()).toContain("can't be longer than 50");
		});
	});

	describe('setting counter group description', () => {
		it('should set a description for the counter group', async () => {
			// Arrange
			const group = createMockCounterGroup({ name: 'Spell Slots', description: null });
			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterGroupByName).mockReturnValue(group);
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter-group',
				subcommand: 'set',
				options: {
					[opts.counterGroupName]: 'Spell Slots',
					[opts.counterGroupSetOption]: optionChoices.setOption.description,
					[opts.counterGroupSetValue]: 'Available spell slots per level',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
			expect(group.description).toBe('Available spell slots per level');
		});

		it('should reject description that is too long', async () => {
			// Arrange
			const group = createMockCounterGroup({ name: 'Spell Slots' });
			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterGroupByName).mockReturnValue(group);

			const longDescription = 'A'.repeat(301);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter-group',
				subcommand: 'set',
				options: {
					[opts.counterGroupName]: 'Spell Slots',
					[opts.counterGroupSetOption]: optionChoices.setOption.description,
					[opts.counterGroupSetValue]: longDescription,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - KoboldError is caught and responded to
			expect(result.didRespond()).toBe(true);
			expect(result.getResponseContent()).toContain("can't be longer than 300");
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
				subcommand: 'set',
				options: {
					[opts.counterGroupName]: 'Nonexistent',
					[opts.counterGroupSetOption]: optionChoices.setOption.name,
					[opts.counterGroupSetValue]: 'New Name',
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
				subcommand: 'set',
				options: {
					[opts.counterGroupName]: 'MissingGroup',
					[opts.counterGroupSetOption]: optionChoices.setOption.name,
					[opts.counterGroupSetValue]: 'New Name',
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
