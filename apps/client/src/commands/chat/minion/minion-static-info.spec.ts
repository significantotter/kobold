import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MinionDefinition } from '@kobold/documentation';
import {
	CommandTestHarness,
	createMockSheetRecord,
	createTestHarness,
	getMockKobold,
	resetMockKobold,
	TEST_CHANNEL_ID,
	TEST_GUILD_ID,
	TEST_USER_ID,
} from '../../../test-utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { MinionCommand } from './minion-command.js';
import { MinionCreateSubCommand } from './minion-create-subcommand.js';
import { MinionUpdateSubCommand } from './minion-update-subcommand.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');

const opts = MinionDefinition.commandOptionsEnum;

function setupMinionKoboldUtilsMocks() {
	const fetchNonNullableDataMock = vi.fn();
	vi.mocked(KoboldUtils).mockImplementation(function (this: any) {
		this.fetchNonNullableDataForCommand = fetchNonNullableDataMock;
		this.adjustedSheetService = { triggerRecompute: vi.fn() };
		return this;
	} as any);
	return { fetchNonNullableDataMock };
}

describe('minion static sheet information', () => {
	const kobold = getMockKobold();
	let harness: CommandTestHarness;

	beforeEach(() => {
		resetMockKobold(kobold);
		harness = createTestHarness([
			new MinionCommand([new MinionCreateSubCommand(), new MinionUpdateSubCommand()]),
		]);
	});

	it('applies static creation options before level-based stats', async () => {
		const activeCharacter = {
			id: 42,
			name: 'Summoner',
			sheetRecordId: 99,
			sheetRecord: createMockSheetRecord({ id: 99 }),
		};
		const { fetchNonNullableDataMock } = setupMinionKoboldUtilsMocks();
		fetchNonNullableDataMock.mockResolvedValue({
			activeCharacter,
			userSettings: {},
		});
		kobold.minion.readManyLite.mockResolvedValue([]);
		kobold.sheetRecord.create.mockImplementation(async ({ sheet }) =>
			createMockSheetRecord({ sheet })
		);

		await harness.executeCommand({
			commandName: 'minion',
			subcommand: 'create',
			options: {
				[opts.name]: 'Companion',
				[opts.level]: 4,
				[opts.keyAbility]: 'dexterity',
				[opts.usesStamina]: true,
				[opts.stats]: 'hp=[level]*10',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
			channelId: TEST_CHANNEL_ID,
		});

		const createdSheet = kobold.sheetRecord.create.mock.calls[0][0].sheet;
		expect(createdSheet.staticInfo).toMatchObject({
			name: 'Companion',
			level: 4,
			keyAbility: 'dexterity',
			usesStamina: true,
		});
		expect(createdSheet.baseCounters.hp.max).toBe(40);
	});

	it('updates static options independently from sheet modifiers', async () => {
		const activeCharacter = {
			id: 42,
			name: 'Summoner',
			sheetRecordId: 99,
			sheetRecord: createMockSheetRecord({ id: 99 }),
		};
		const { fetchNonNullableDataMock } = setupMinionKoboldUtilsMocks();
		fetchNonNullableDataMock.mockResolvedValue({ activeCharacter });
		const sheetRecord = createMockSheetRecord();
		const minion = {
			id: 10,
			name: 'Companion',
			characterId: activeCharacter.id,
			sheetRecordId: sheetRecord.id,
			sheetRecord,
			actions: [],
			rollMacros: [],
			modifiers: [],
		};
		kobold.minion.readManyByUserId.mockResolvedValue([minion]);

		await harness.executeCommand({
			commandName: 'minion',
			subcommand: 'update',
			options: {
				[opts.minion]: 'Companion',
				[opts.level]: 8,
				[opts.keyAbility]: 'wisdom',
				[opts.usesStamina]: true,
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
			channelId: TEST_CHANNEL_ID,
		});

		const updatedSheet = kobold.sheetRecord.update.mock.calls[0][1].sheet;
		expect(updatedSheet.staticInfo).toMatchObject({
			name: 'Companion',
			level: 8,
			keyAbility: 'wisdom',
			usesStamina: true,
		});
	});
});
