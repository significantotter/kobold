/**
 * Unit tests for InitRemoveSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Kobold } from '@kobold/db';
import { InteractionUtils } from '../../../utils/interaction-utils.js';
import { InitDefinition } from '@kobold/documentation';
import { InitCommand } from './init-command.js';
import { InitRemoveSubCommand } from './init-remove-subcommand.js';
import { createMockInitiativeWithActors, resetInitTestIds } from './init-test-utils.js';

const opts = InitDefinition.commandOptionsEnum;

import {
	createTestHarness,
	createMockChatInputInteraction,
	createMockKobold,
	setupKoboldUtilsMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	TEST_CHANNEL_ID,
	CommandTestHarness,
	getMockKobold,
	resetMockKobold,
} from '../../../test-utils/index.js';
import { KoboldError } from '@kobold/util';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');

describe('InitRemoveSubCommand', () => {
	const kobold = getMockKobold();

	let harness: CommandTestHarness;

	beforeEach(() => {
		resetMockKobold(kobold);
		resetInitTestIds();
		harness = createTestHarness([new InitCommand([new InitRemoveSubCommand()])]);
	});

	it('should remove an actor from initiative', async () => {
		vi.spyOn(console, 'warn').mockImplementation(() => {});

		// Arrange
		const existingInit = createMockInitiativeWithActors(2, { currentRound: 1 });
		const { fetchNonNullableDataMock } = setupKoboldUtilsMocks();
		fetchNonNullableDataMock.mockResolvedValue({
			currentInitiativeLite: existingInit,
			userSettings: {},
		});
		kobold.initiativeActor.delete.mockResolvedValue(existingInit.actors[0]);
		kobold.initiativeActorGroup.delete.mockResolvedValue(existingInit.actorGroups[0]);

		// Act
		const result = await harness.executeCommand({
			commandName: 'init',
			subcommand: 'remove',
			options: {
				[opts.initCharacter]: 'Actor 1',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
			channelId: TEST_CHANNEL_ID,
		});

		// Assert
		expect(result.didRespond()).toBe(true);
		expect(kobold.initiativeActor.delete).toHaveBeenCalled();
	});

	it('should error when no initiative exists', async () => {
		// Arrange
		const { fetchNonNullableDataMock } = setupKoboldUtilsMocks();
		fetchNonNullableDataMock.mockRejectedValue(
			new KoboldError('Yip! You must be in an initiative to use this command.')
		);

		// Act
		const result = await harness.executeCommand({
			commandName: 'init',
			subcommand: 'remove',
			options: {
				[opts.initCharacter]: 'Actor 1',
			},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
			channelId: TEST_CHANNEL_ID,
		});

		// Assert
		expect(result.didRespond()).toBe(true);
		expect(result.getResponseContent()).toContain('You must be in an initiative');
	});
});

describe('initiative removal regressions', () => {
	const kobold = getMockKobold();
	beforeEach(() => {
		resetMockKobold(kobold);
		resetInitTestIds();
		vi.spyOn(console, 'warn').mockImplementation(() => {});
	});

	function arrange(count = 2, round = 1) {
		const initiative = createMockInitiativeWithActors(count, { currentRound: round });
		setupKoboldUtilsMocks().fetchNonNullableDataMock.mockResolvedValue({
			currentInitiativeLite: initiative,
			userSettings: { initStatsNotification: 'whenever_hidden' },
		});
		const interaction = createMockChatInputInteraction({
			commandName: 'init',
			subcommand: 'remove',
			userId: initiative.actors[0].userId,
			options: { [opts.initCharacter]: 'Actor 1' },
		});
		return {
			initiative,
			interaction,
			execute: () =>
				new InitRemoveSubCommand().execute(interaction, {
					kobold: kobold as unknown as Kobold,
				}),
		};
	}

	it('keeps the active turn when removing one member of the only group', async () => {
		const { initiative, execute } = arrange();
		initiative.actors[1].initiativeActorGroupId = initiative.actorGroups[0].id;
		initiative.actorGroups = [initiative.actorGroups[0]];
		await expect(execute()).resolves.toBeUndefined();
		expect(kobold.initiativeActor.delete).toHaveBeenCalledWith({ id: initiative.actors[0].id });
		expect(kobold.initiativeActorGroup.delete).not.toHaveBeenCalled();
		expect(kobold.initiative.update).not.toHaveBeenCalled();
		expect(console.warn).not.toHaveBeenCalled();
	});

	it.each([1, 2])(
		'removes the first active group in round %i with the correct round',
		async round => {
			const { initiative, execute } = arrange(2, round);
			await execute();
			expect(kobold.initiative.update).toHaveBeenCalledWith(
				{ id: initiative.id },
				{
					currentRound: 1,
					currentTurnGroupId: initiative.actorGroups[1].id,
				}
			);
			expect(console.warn).not.toHaveBeenCalled();
		}
	);

	it('rewinds to the preceding group when removing a later active group', async () => {
		const { initiative, execute } = arrange(3, 2);
		initiative.currentTurnGroupId = initiative.actorGroups[0].id;
		initiative.actorGroups[0].initiativeResult = 18.5;
		const previousId = initiative.actorGroups[1].id;
		await execute();
		expect(kobold.initiative.update).toHaveBeenCalledWith(
			{ id: initiative.id },
			{
				currentRound: 2,
				currentTurnGroupId: previousId,
			}
		);
	});

	it.each([0, 1, 3])(
		'clears the turn and resets the round when removing the last actor in round %i',
		async round => {
			const { initiative, execute } = arrange(1, round);
			await execute();
			expect(kobold.initiativeActorGroup.delete).toHaveBeenCalled();
			expect(kobold.initiative.update).toHaveBeenCalledWith(
				{ id: initiative.id },
				{
					currentRound: 0,
					currentTurnGroupId: null,
				}
			);
			expect(console.warn).not.toHaveBeenCalled();
		}
	);

	it('does not change the turn when removing an inactive actor', async () => {
		const { initiative, execute } = arrange();
		initiative.currentTurnGroupId = initiative.actorGroups[1].id;
		await execute();
		expect(kobold.initiative.update).not.toHaveBeenCalled();
	});

	it.each(['cleanup', 'turn update', 'group deletion'])(
		'uses transaction-scoped models and sends no success on %s failure',
		async stage => {
			const { execute, interaction } = arrange();
			const transaction = createMockKobold();
			const failure = new Error('database failure');
			const method =
				stage === 'cleanup'
					? transaction.sheetRecord.deleteOrphaned
					: stage === 'turn update'
						? transaction.initiative.update
						: transaction.initiativeActorGroup.delete;
			method.mockRejectedValue(failure);
			kobold.transaction.mockImplementationOnce(async callback => callback(transaction));
			await expect(execute()).rejects.toThrow(failure);
			expect(transaction.initiativeActor.delete).toHaveBeenCalled();
			expect(kobold.initiativeActor.delete).not.toHaveBeenCalled();
			expect(interaction.reply).not.toHaveBeenCalled();
			expect(interaction.editReply).not.toHaveBeenCalled();
			expect(interaction.followUp).not.toHaveBeenCalled();
		}
	);

	it('reports removal success when the hidden-stat DM is rejected', async () => {
		const { initiative, interaction, execute } = arrange();
		const send = vi.spyOn(InteractionUtils, 'send');
		initiative.actors[1].hideStats = true;
		vi.spyOn(interaction.client.users, 'send').mockRejectedValue(
			new Error('Cannot send messages to this user')
		);
		await expect(execute()).resolves.toBeUndefined();
		expect(interaction.client.users.send).toHaveBeenCalled();
		expect(send).toHaveBeenLastCalledWith(
			interaction,
			expect.stringContaining('removed successfully')
		);
		expect(kobold.initiative.update).toHaveBeenCalled();
		expect(console.warn).toHaveBeenCalledWith(
			'Initiative actor removed, but notification failed',
			expect.any(Object)
		);
	});
	it('does not throw a removal error if Discord rejects both confirmation attempts', async () => {
		const { execute } = arrange();
		vi.spyOn(InteractionUtils, 'send').mockRejectedValue(new Error('Discord unavailable'));
		await expect(execute()).resolves.toBeUndefined();
		expect(kobold.initiativeActor.delete).toHaveBeenCalled();
		expect(InteractionUtils.send).toHaveBeenCalledTimes(2);
	});
});
