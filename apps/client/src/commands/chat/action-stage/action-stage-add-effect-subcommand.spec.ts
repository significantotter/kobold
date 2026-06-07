import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ActionEffectTriggerEnum, RollTypeEnum, SheetAdjustmentTypeEnum } from '@kobold/db';
import { ActionStageCommand } from './action-stage-command.js';
import { ActionStageAddEffectSubCommand } from './action-stage-add-effect-subcommand.js';
import {
	CommandTestHarness,
	TEST_GUILD_ID,
	TEST_USER_ID,
	createMockAction,
	createTestHarness,
	getMockKobold,
	resetMockKobold,
	setupActionModelMock,
	setupFinderHelpersMocks,
	setupKoboldUtilsMocks,
} from '../../../test-utils/index.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-helpers/finder-helpers.js');

describe('ActionStageAddEffectSubCommand', () => {
	const kobold = getMockKobold();
	let harness: CommandTestHarness;

	beforeEach(() => {
		resetMockKobold(kobold);
		harness = createTestHarness([
			new ActionStageCommand([new ActionStageAddEffectSubCommand()]),
		]);
	});

	it('adds an effect stage to an action', async () => {
		const action = createMockAction({ name: 'Demoralize', rolls: [] });
		setupKoboldUtilsMocks({ actions: [action] });
		setupFinderHelpersMocks(action, [action]);
		const { updateMock } = setupActionModelMock(kobold);

		const result = await harness.executeCommand({
			commandName: 'action-stage',
			subcommand: 'add-effect',
			options: {
				action: 'Demoralize',
				'roll-name': 'Frightened',
				trigger: 'success or better',
				'condition-name': 'frightened',
				'condition-type': 'status',
				'condition-severity': '1',
				'condition-sheet-values': 'ac-[severity]',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		expect(result.didRespond()).toBe(true);
		expect(updateMock).toHaveBeenCalledWith(
			{ id: action.id },
			{
				rolls: [
					expect.objectContaining({
						name: 'Frightened',
						type: RollTypeEnum.effect,
						trigger: ActionEffectTriggerEnum.successOrBetter,
						condition: expect.objectContaining({
							name: 'frightened',
							severity: 1,
							type: SheetAdjustmentTypeEnum.status,
						}),
					}),
				],
			}
		);
	});

	it('requires target tags when a roll adjustment is provided', async () => {
		const action = createMockAction({ name: 'Demoralize', rolls: [] });
		setupKoboldUtilsMocks({ actions: [action] });
		setupFinderHelpersMocks(action, [action]);
		const { updateMock } = setupActionModelMock(kobold);

		const result = await harness.executeCommand({
			commandName: 'action-stage',
			subcommand: 'add-effect',
			options: {
				action: 'Demoralize',
				'roll-name': 'Frightened',
				trigger: 'success or better',
				'condition-name': 'frightened',
				'condition-roll-adjustment': '-1',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		expect(result.didRespond()).toBe(true);
		expect(updateMock).not.toHaveBeenCalled();
	});
});
