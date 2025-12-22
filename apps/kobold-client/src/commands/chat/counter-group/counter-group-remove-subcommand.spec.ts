/**
 * Unit tests for CounterGroupRemoveSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CounterStyleEnum } from '@kobold/db';
import { CounterGroupDefinition } from '@kobold/documentation';
import { CounterGroupCommand } from './counter-group-command.js';
import { CounterGroupRemoveSubCommand } from './counter-group-remove-subcommand.js';

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
import { CollectorUtils } from '../../../utils/collector-utils.js';
import type { CounterGroup, NumericCounter } from '@kobold/db';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/collector-utils.js');

describe('CounterGroupRemoveSubCommand', () => {
	const kobold = getMockKobold();

	let harness: CommandTestHarness;

	beforeEach(() => {
		resetMockKobold(kobold);
		harness = createTestHarness([
			new CounterGroupCommand([new CounterGroupRemoveSubCommand()]),
		]);
	});

	describe('removing counter groups', () => {
		it('should remove a counter group when confirmed', async () => {
			// Arrange
			const group = createMockCounterGroup({ name: 'Spell Slots' });
			const { mockCharacter, fetchDataMock } = setupKoboldUtilsMocks();
			mockCharacter.sheetRecord.sheet.counterGroups = [group];
			fetchDataMock.mockResolvedValue({ activeCharacter: mockCharacter });

			vi.mocked(CollectorUtils.collectByButton).mockResolvedValue({
				intr: {} as any,
				value: 'remove',
			});
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter-group',
				subcommand: 'remove',
				options: { [opts.counterGroupName]: 'Spell Slots' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();

			// Verify the counter group was removed from the update call
			const updateCall = updateMock.mock.calls[0];
			const updateData = updateCall[1];
			expect(updateData.sheet.counterGroups).not.toContainEqual(
				expect.objectContaining({ name: 'Spell Slots' })
			);
		});

		it('should not remove counter group when cancelled', async () => {
			// Arrange
			const group = createMockCounterGroup({ name: 'Spell Slots' });
			const { mockCharacter, fetchDataMock } = setupKoboldUtilsMocks();
			mockCharacter.sheetRecord.sheet.counterGroups = [group];
			fetchDataMock.mockResolvedValue({ activeCharacter: mockCharacter });

			vi.mocked(CollectorUtils.collectByButton).mockResolvedValue({
				intr: {} as any,
				value: 'cancel',
			});
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter-group',
				subcommand: 'remove',
				options: { [opts.counterGroupName]: 'Spell Slots' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).not.toHaveBeenCalled();
		});

		it('should remove counter group case-insensitively', async () => {
			// Arrange
			const group = createMockCounterGroup({ name: 'Spell Slots' });
			const { mockCharacter, fetchDataMock } = setupKoboldUtilsMocks();
			mockCharacter.sheetRecord.sheet.counterGroups = [group];
			fetchDataMock.mockResolvedValue({ activeCharacter: mockCharacter });

			vi.mocked(CollectorUtils.collectByButton).mockResolvedValue({
				intr: {} as any,
				value: 'remove',
			});
			const { updateMock } = setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter-group',
				subcommand: 'remove',
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
			const { mockCharacter, fetchDataMock } = setupKoboldUtilsMocks();
			mockCharacter.sheetRecord.sheet.counterGroups = [];
			fetchDataMock.mockResolvedValue({ activeCharacter: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter-group',
				subcommand: 'remove',
				options: { [opts.counterGroupName]: 'Nonexistent' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - KoboldError is caught and responded to
			expect(result.didRespond()).toBe(true);
			expect(result.getResponseContent()).toContain("couldn't find");
		});
	});

	describe('response messages', () => {
		it('should use documentation strings for confirmation prompt', async () => {
			// Arrange
			const group = createMockCounterGroup({ name: 'Spell Slots' });
			const { mockCharacter, fetchDataMock } = setupKoboldUtilsMocks();
			mockCharacter.sheetRecord.sheet.counterGroups = [group];
			fetchDataMock.mockResolvedValue({ activeCharacter: mockCharacter });

			vi.mocked(CollectorUtils.collectByButton).mockResolvedValue({
				intr: {} as any,
				value: 'cancel',
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter-group',
				subcommand: 'remove',
				options: { [opts.counterGroupName]: 'Spell Slots' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - interaction.reply was called with confirmation prompt
			expect(result.interaction.reply).toHaveBeenCalled();
			const replyCall = result.interaction.reply.mock.calls[0][0];
			expect(replyCall.content).toBe(
				strings.removeConfirmation.text({ groupName: 'Spell Slots' })
			);
		});

		it('should show success message after removal', async () => {
			// Arrange
			const group = createMockCounterGroup({ name: 'Spell Slots' });
			const { mockCharacter, fetchDataMock } = setupKoboldUtilsMocks();
			mockCharacter.sheetRecord.sheet.counterGroups = [group];
			fetchDataMock.mockResolvedValue({ activeCharacter: mockCharacter });

			vi.mocked(CollectorUtils.collectByButton).mockResolvedValue({
				intr: {} as any,
				value: 'remove',
			});
			setupSheetRecordUpdateMock(kobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter-group',
				subcommand: 'remove',
				options: { [opts.counterGroupName]: 'Spell Slots' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});
});
