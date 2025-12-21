/**
 * Integration tests for InitAddSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vitestKobold } from '@kobold/db/test-utils';
import { InitDefinition } from '@kobold/documentation';
import { InitCommand } from './init-command.js';
import { InitAddSubCommand } from './init-add-subcommand.js';
import {
	createMockInitiative,
	createMockActorGroup,
	createMockSheetRecord,
	createMockInitiativeActor,
	resetInitTestIds,
} from './init-test-utils.js';

const opts = InitDefinition.commandOptionsEnum;

import {
	createTestHarness,
	setupKoboldUtilsMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	TEST_CHANNEL_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';
import { KoboldError } from '../../../utils/KoboldError.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');

describe('InitAddSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		resetInitTestIds();
		harness = createTestHarness([new InitCommand([new InitAddSubCommand()])]);
	});


	it('should error when no initiative exists', async () => {
		// Arrange
		const { fetchDataMock } = setupKoboldUtilsMocks();
		fetchDataMock.mockRejectedValue(
			new KoboldError('Yip! You must be in an initiative to use this command.')
		);

		// Act
		const result = await harness.executeCommand({
			commandName: 'init',
			subcommand: 'add',
			options: {
				[opts.initCreature]: 'Custom NPC',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
			channelId: TEST_CHANNEL_ID,
		});

		// Assert
		expect(result.didRespond()).toBe(true);
		expect(result.getResponseContent()).toContain('You must be in an initiative');
	});

	it('should add a custom NPC to initiative', async () => {
		// Arrange
		const existingInit = createMockInitiative();
		const { fetchDataMock } = setupKoboldUtilsMocks();
		fetchDataMock.mockResolvedValue({
			currentInitiative: existingInit,
			userSettings: {},
		});

		const initActorCreateSpy = vi.spyOn(vitestKobold.initiativeActor, 'create');
		const initGroupCreateSpy = vi.spyOn(vitestKobold.initiativeActorGroup, 'create');
		const sheetRecordCreateSpy = vi.spyOn(vitestKobold.sheetRecord, 'create');

		const mockGroup = createMockActorGroup({
			initiativeId: existingInit.id,
			name: 'Test Enemy',
			initiativeResult: 15,
		});
		const mockSheetRecord = createMockSheetRecord();
		const mockActor = createMockInitiativeActor({
			name: 'Test Enemy',
			initiativeId: existingInit.id,
			initiativeActorGroupId: mockGroup.id,
			actorGroup: mockGroup,
			sheetRecord: mockSheetRecord,
			sheetRecordId: mockSheetRecord.id,
			hideStats: true,
		});

		initGroupCreateSpy.mockResolvedValue(mockGroup);
		sheetRecordCreateSpy.mockResolvedValue(mockSheetRecord);
		initActorCreateSpy.mockResolvedValue(mockActor);

		// Act
		const result = await harness.executeCommand({
			commandName: 'init',
			subcommand: 'add',
			options: {
				[opts.initCreature]: 'Custom NPC',
				[opts.initActor]: 'Test Enemy',
				[opts.initValue]: 15,
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
			channelId: TEST_CHANNEL_ID,
		});

		// Assert
		expect(result.didRespond()).toBe(true);
	});
});
