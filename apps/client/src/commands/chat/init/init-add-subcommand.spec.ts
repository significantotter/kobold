/**
 * Unit tests for InitAddSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
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
	TEST_USER_ID,
	TEST_GUILD_ID,
	TEST_CHANNEL_ID,
	CommandTestHarness,
	getMockKobold,
	resetMockKobold,
} from '../../../test-utils/index.js';
import { KoboldError } from '@kobold/util';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');

function setupInitKoboldUtilsMocks() {
	const fetchNonNullableDataMock = vi.fn();
	vi.mocked(KoboldUtils).mockImplementation(function (this: any) {
		this.fetchNonNullableDataForCommand = fetchNonNullableDataMock;
		this.adjustedSheetService = { triggerRecompute: vi.fn() };
		return this;
	} as any);
	return { fetchNonNullableDataMock };
}

describe('InitAddSubCommand', () => {
	const kobold = getMockKobold();

	let harness: CommandTestHarness;

	beforeEach(() => {
		resetMockKobold(kobold);
		resetInitTestIds();
		harness = createTestHarness([new InitCommand([new InitAddSubCommand()])]);
	});

	it('should error when no initiative exists', async () => {
		// Arrange
		const { fetchNonNullableDataMock } = setupInitKoboldUtilsMocks();
		fetchNonNullableDataMock.mockRejectedValue(
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
		const { fetchNonNullableDataMock } = setupInitKoboldUtilsMocks();
		fetchNonNullableDataMock.mockResolvedValue({
			currentInitiative: existingInit,
			userSettings: {},
		});

		const initActorCreateSpy = kobold.initiativeActor.create;
		const initGroupCreateSpy = kobold.initiativeActorGroup.create;
		const sheetRecordCreateSpy = kobold.sheetRecord.create;

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
		kobold.sheetRecord.create.mockResolvedValue(mockSheetRecord);
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

	it('should apply NPC static options before level-based custom stats', async () => {
		const existingInit = createMockInitiative();
		const { fetchNonNullableDataMock } = setupInitKoboldUtilsMocks();
		fetchNonNullableDataMock.mockResolvedValue({
			currentInitiative: existingInit,
			userSettings: {},
		});

		const mockGroup = createMockActorGroup({
			initiativeId: existingInit.id,
			name: 'Scaling Enemy',
			initiativeResult: 15,
		});
		const mockSheetRecord = createMockSheetRecord();
		const mockActor = createMockInitiativeActor({
			name: 'Scaling Enemy',
			initiativeId: existingInit.id,
			initiativeActorGroupId: mockGroup.id,
			actorGroup: mockGroup,
			sheetRecord: mockSheetRecord,
			sheetRecordId: mockSheetRecord.id,
		});
		kobold.initiativeActorGroup.create.mockResolvedValue(mockGroup);
		kobold.sheetRecord.create.mockResolvedValue(mockSheetRecord);
		kobold.initiativeActor.create.mockResolvedValue(mockActor);

		const result = await harness.executeCommand({
			commandName: 'init',
			subcommand: 'add',
			options: {
				[opts.initCreature]: 'Custom NPC',
				[opts.initActor]: 'Scaling Enemy',
				[opts.initValue]: 15,
				[opts.level]: 5,
				[opts.keyAbility]: 'strength',
				[opts.usesStamina]: true,
				[opts.initCustomStats]: 'hp=[level]*10',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
			channelId: TEST_CHANNEL_ID,
		});

		expect(result.getResponseContent()).not.toContain('unexpected error');
		const createdSheet = kobold.sheetRecord.create.mock.calls[0][0].sheet;
		expect(createdSheet.staticInfo).toMatchObject({
			name: 'Scaling Enemy',
			level: 5,
			keyAbility: 'strength',
			usesStamina: true,
		});
		expect(createdSheet.baseCounters.hp.max).toBe(50);
	});
});
