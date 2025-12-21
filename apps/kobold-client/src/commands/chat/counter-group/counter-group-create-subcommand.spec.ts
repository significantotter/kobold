/**
 * Integration tests for CounterGroupCreateSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vitestKobold } from '@kobold/db/test-utils';
import { CounterGroupDefinition } from '@kobold/documentation';
import { CounterGroupCommand } from './counter-group-command.js';
import { CounterGroupCreateSubCommand } from './counter-group-create-subcommand.js';

const opts = CounterGroupDefinition.commandOptionsEnum;
const strings = CounterGroupDefinition.strings;

import {
	createTestHarness,
	createMockCharacter,
	setupKoboldUtilsMocks,
	setupSheetRecordUpdateMock,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
	createMockCounterGroup,
} from '../../../test-utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import type { CounterGroup } from '@kobold/db';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-helpers/finder-helpers.js');

describe('CounterGroupCreateSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([
			new CounterGroupCommand([new CounterGroupCreateSubCommand()]),
		]);
	});

	describe('creating counter groups', () => {
		it('should create a basic counter group', async () => {
			// Arrange
			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter: null,
				group: null,
			});
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter-group',
				subcommand: 'create',
				options: {
					[opts.counterGroupName]: 'Spell Slots',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(result.getResponseContent()).toContain('Spell Slots');
			expect(updateMock).toHaveBeenCalled();

			// Verify the update was called with the new counter group
			const updateCall = updateMock.mock.calls[0];
			const updateData = updateCall[1];
			expect(updateData.sheet.counterGroups).toContainEqual(
				expect.objectContaining({
					name: 'Spell Slots',
					description: null,
					counters: [],
				})
			);
		});

		it('should create a counter group with description', async () => {
			// Arrange
			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter: null,
				group: null,
			});
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter-group',
				subcommand: 'create',
				options: {
					[opts.counterGroupName]: 'Daily Powers',
					[opts.counterGroupDescription]: 'Powers that reset on a long rest',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();

			const updateCall = updateMock.mock.calls[0];
			const updateData = updateCall[1];
			expect(updateData.sheet.counterGroups).toContainEqual(
				expect.objectContaining({
					name: 'Daily Powers',
					description: 'Powers that reset on a long rest',
					counters: [],
				})
			);
		});

		it('should trim whitespace from name', async () => {
			// Arrange
			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter: null,
				group: null,
			});
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter-group',
				subcommand: 'create',
				options: {
					[opts.counterGroupName]: '  Spell Slots  ',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			const updateCall = updateMock.mock.calls[0];
			const updateData = updateCall[1];
			expect(updateData.sheet.counterGroups).toContainEqual(
				expect.objectContaining({
					name: 'Spell Slots',
				})
			);
		});
	});

	describe('validation errors', () => {
		it('should reject name that is too long', async () => {
			// Arrange
			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter: null,
				group: null,
			});

			const longName = 'A'.repeat(51);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter-group',
				subcommand: 'create',
				options: {
					[opts.counterGroupName]: longName,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - KoboldError is caught and responded to
			expect(result.didRespond()).toBe(true);
			expect(result.getResponseContent()).toContain('less than 50 characters');
		});

		it('should reject description that is too long', async () => {
			// Arrange
			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter: null,
				group: null,
			});

			const longDescription = 'A'.repeat(301);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter-group',
				subcommand: 'create',
				options: {
					[opts.counterGroupName]: 'Valid Name',
					[opts.counterGroupDescription]: longDescription,
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - KoboldError is caught and responded to
			expect(result.didRespond()).toBe(true);
			expect(result.getResponseContent()).toContain('less than 300 characters');
		});

		it('should reject if counter with same name exists', async () => {
			// Arrange
			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter: { name: 'Existing Counter' } as any,
				group: null,
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter-group',
				subcommand: 'create',
				options: {
					[opts.counterGroupName]: 'Existing Counter',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - KoboldError is caught and responded to
			expect(result.didRespond()).toBe(true);
			expect(result.getResponseContent()).toContain('already exists');
		});

		it('should reject if counter group with same name exists', async () => {
			// Arrange
			const existingGroup = createMockCounterGroup({ name: 'Spell Slots' });
			const { mockCharacter, fetchDataMock } = setupKoboldUtilsMocks();
			mockCharacter.sheetRecord.sheet.counterGroups = [existingGroup];

			// Re-mock with the updated character
			fetchDataMock.mockResolvedValue({
				activeCharacter: mockCharacter,
			});

			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter: null,
				group: null,
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter-group',
				subcommand: 'create',
				options: {
					[opts.counterGroupName]: 'Spell Slots',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - KoboldError is caught and responded to
			expect(result.didRespond()).toBe(true);
			expect(result.getResponseContent()).toContain('already exists');
		});

		it('should reject case-insensitive duplicate names', async () => {
			// Arrange
			const existingGroup = createMockCounterGroup({ name: 'SPELL SLOTS' });
			const { mockCharacter, fetchDataMock } = setupKoboldUtilsMocks();
			mockCharacter.sheetRecord.sheet.counterGroups = [existingGroup];

			// Re-mock with the updated character
			fetchDataMock.mockResolvedValue({
				activeCharacter: mockCharacter,
			});

			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter: null,
				group: null,
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter-group',
				subcommand: 'create',
				options: {
					[opts.counterGroupName]: 'spell slots',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - KoboldError is caught and responded to
			expect(result.didRespond()).toBe(true);
			expect(result.getResponseContent()).toContain('already exists');
		});
	});

	describe('response messages', () => {
		it('should include character name in success message', async () => {
			// Arrange
			setupKoboldUtilsMocks({ characterOverrides: { name: 'Testy McTestface' } });
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter: null,
				group: null,
			});
			setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter-group',
				subcommand: 'create',
				options: {
					[opts.counterGroupName]: 'Resources',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			const content = result.getResponseContent();
			expect(content).toContain('Resources');
			expect(content).toContain('Testy McTestface');
		});

		it('should use documentation strings for response', async () => {
			// Arrange
			setupKoboldUtilsMocks({ characterOverrides: { name: 'Otter' } });
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter: null,
				group: null,
			});
			setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter-group',
				subcommand: 'create',
				options: {
					[opts.counterGroupName]: 'Spells',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			const expectedMessage = strings.created({
				groupName: 'Spells',
				characterName: 'Otter',
			});
			expect(result.getResponseContent()).toBe(expectedMessage);
		});
	});
});
