import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InitDefinition } from '@kobold/documentation';
import {
	CommandTestHarness,
	createMockInitiativeWithActors,
	createTestHarness,
	getMockKobold,
	resetMockKobold,
	TEST_CHANNEL_ID,
	TEST_GUILD_ID,
	TEST_USER_ID,
} from '../../../test-utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { InitCommand } from './init-command.js';
import { InitNpcUpdateSubCommand } from './init-npc-update-subcommand.js';
import { resetInitTestIds } from './init-test-utils.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');

const opts = InitDefinition.commandOptionsEnum;

function setupInitKoboldUtilsMocks() {
	const fetchNonNullableDataMock = vi.fn();
	const getInitNpcTargetOptionsMock = vi.fn();
	const triggerRecomputeMock = vi.fn();
	vi.mocked(KoboldUtils).mockImplementation(function (this: any) {
		this.fetchNonNullableDataForCommand = fetchNonNullableDataMock;
		this.autocompleteUtils = {
			getInitNpcTargetOptions: getInitNpcTargetOptionsMock,
		};
		this.adjustedSheetService = { triggerRecompute: triggerRecomputeMock };
		return this;
	} as any);
	return {
		fetchNonNullableDataMock,
		getInitNpcTargetOptionsMock,
		triggerRecomputeMock,
	};
}

describe('InitNpcUpdateSubCommand', () => {
	const kobold = getMockKobold();
	let harness: CommandTestHarness;

	beforeEach(() => {
		resetMockKobold(kobold);
		resetInitTestIds();
		harness = createTestHarness([new InitCommand([new InitNpcUpdateSubCommand()])]);
	});

	it('updates static options before applying level-based stats', async () => {
		const existingInit = createMockInitiativeWithActors(1);
		const actor = existingInit.actors[0];
		const { fetchNonNullableDataMock, triggerRecomputeMock } =
			setupInitKoboldUtilsMocks();
		fetchNonNullableDataMock.mockResolvedValue({ currentInitiative: existingInit });
		kobold.sheetRecord.read.mockResolvedValue(actor.sheetRecord);

		const result = await harness.executeCommand({
			commandName: 'init',
			subcommand: 'npc-update',
			options: {
				[opts.initNpc]: actor.name,
				[opts.npcStats]: 'hp=[level]*10',
				[opts.level]: 6,
				[opts.keyAbility]: 'wisdom',
				[opts.usesStamina]: true,
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
			channelId: TEST_CHANNEL_ID,
		});

		const updatedSheet = kobold.sheetRecord.update.mock.calls[0][1].sheet;
		expect(updatedSheet.staticInfo).toMatchObject({
			name: actor.name,
			level: 6,
			keyAbility: 'wisdom',
			usesStamina: true,
		});
		expect(updatedSheet.baseCounters.hp.max).toBe(60);
		expect(triggerRecomputeMock).toHaveBeenCalledWith(actor.sheetRecordId);
		expect(result.getResponseContent()).toContain(`updated the NPC "${actor.name}"`);
	});

	it.each([
		['character', { characterId: 42 }],
		['minion', { minionId: 42 }],
	])('rejects an initiative %s', async (_type, relation) => {
		const existingInit = createMockInitiativeWithActors(1);
		Object.assign(existingInit.actors[0], relation);
		const { fetchNonNullableDataMock } = setupInitKoboldUtilsMocks();
		fetchNonNullableDataMock.mockResolvedValue({ currentInitiative: existingInit });

		const result = await harness.executeCommand({
			commandName: 'init',
			subcommand: 'npc-update',
			options: {
				[opts.initNpc]: existingInit.actors[0].name,
				[opts.level]: 3,
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
			channelId: TEST_CHANNEL_ID,
		});

		expect(result.getResponseContent()).toContain('can only target NPCs');
		expect(kobold.sheetRecord.update).not.toHaveBeenCalled();
	});

	it('uses NPC-only autocomplete targets', async () => {
		const { getInitNpcTargetOptionsMock } = setupInitKoboldUtilsMocks();
		getInitNpcTargetOptionsMock.mockResolvedValue([
			{ name: 'Kobold Mage', value: 'Kobold Mage' },
		]);

		const result = await harness.executeAutocomplete({
			commandName: 'init',
			subcommand: 'npc-update',
			options: { [opts.initNpc]: 'Kob' },
			focusedOption: { name: opts.initNpc, value: 'Kob' },
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
			channelId: TEST_CHANNEL_ID,
		});

		expect(getInitNpcTargetOptionsMock).toHaveBeenCalled();
		expect(result.getChoices()).toEqual([
			{ name: 'Kobold Mage', value: 'Kobold Mage' },
		]);
	});
});
