import {
	InitiativeFactory,
	InitiativeActorFactory,
	InitiativeActorGroupFactory,
	Initiative,
} from '../services/kobold/models/index.js';
import * as initiativeUtils from './initiative-utils.js';
import { CommandInteraction } from 'discord.js';
import { KoboldEmbed } from './kobold-embed-utils.js';

function setupInitiativeActorsAndGroupsForTests(initiative) {
	const actors = InitiativeActorFactory.withFakeId().buildList(
		3,
		{},
		{ transient: { includeGroup: true } }
	);
	const groups = actors.map(actor => actor.actorGroup);
	const firstGroup = groups[2];
	firstGroup.initiativeResult = 10;
	const secondGroup = groups[0];
	secondGroup.initiativeResult = 20;
	const thirdGroup = groups[1];
	thirdGroup.initiativeResult = 30;
	return { actors, groups, firstGroup, secondGroup, thirdGroup };
}

// setup jest tests for each function in ./initiative-utils.ts
describe('initiative-utils', function () {
	describe('InitiativeBuilder', function () {
		test('creates an empty initiative', function () {
			const builder = new initiativeUtils.InitiativeBuilder({});
			expect(builder).toBeDefined();
		});
		describe('getPreviousTurnGroup', function () {
			test('fails to move to the previous turn on the first turn of round 1', function () {
				const initiative = InitiativeFactory.build({
					currentRound: 1,
					currentTurnGroupId: null,
				});
				const { actors, groups, firstGroup, secondGroup, thirdGroup } =
					setupInitiativeActorsAndGroupsForTests(initiative);
				initiative.currentTurnGroupId = firstGroup.id;

				const builder = new initiativeUtils.InitiativeBuilder({
					initiative,
					actors,
					groups,
				});

				expect(builder.getPreviousTurnChanges().errorMessage).toBeDefined();
				expect(builder.getPreviousTurnChanges().currentTurnGroupId).not.toBeDefined();
				expect(builder.getPreviousTurnChanges().currentRound).not.toBeDefined();
			});
			test('fails to move to the previous turn before the initiative has started', function () {
				const initiative = InitiativeFactory.build({
					currentRound: 0,
					currentTurnGroupId: null,
				});
				const { actors, groups, firstGroup, secondGroup, thirdGroup } =
					setupInitiativeActorsAndGroupsForTests(initiative);

				const builder = new initiativeUtils.InitiativeBuilder({
					initiative,
					actors,
					groups,
				});

				expect(builder.getPreviousTurnChanges().errorMessage).toBeDefined();
				expect(builder.getPreviousTurnChanges().currentTurnGroupId).not.toBeDefined();
				expect(builder.getPreviousTurnChanges().currentRound).not.toBeDefined();
			});
			test('moves to the previous turn after initiative has started', function () {
				const initiative = InitiativeFactory.build({
					currentRound: 1,
					currentTurnGroupId: null,
				});
				const { actors, groups, firstGroup, secondGroup, thirdGroup } =
					setupInitiativeActorsAndGroupsForTests(initiative);
				initiative.currentTurnGroupId = secondGroup.id;

				const builder = new initiativeUtils.InitiativeBuilder({
					initiative,
					actors,
					groups,
				});

				expect(builder.getPreviousTurnChanges().currentTurnGroupId).toBe(firstGroup.id);
				expect(builder.getPreviousTurnChanges().currentRound).toBe(1);
				expect(builder.getPreviousTurnChanges().errorMessage).not.toBeDefined();
			});
		});
		describe('getNextTurnChanges', function () {
			test('moves to the previous round on the first turn in a subsequent round', function () {
				const initiative = InitiativeFactory.build({
					currentRound: 2,
					currentTurnGroupId: null,
				});
				const { actors, groups, firstGroup, secondGroup, thirdGroup } =
					setupInitiativeActorsAndGroupsForTests(initiative);
				initiative.currentTurnGroupId = firstGroup.id;

				const builder = new initiativeUtils.InitiativeBuilder({
					initiative,
					actors,
					groups,
				});

				expect(builder.getPreviousTurnChanges().currentRound).toBe(1);
				expect(builder.getPreviousTurnChanges().currentTurnGroupId).toBe(thirdGroup.id);
				expect(builder.getPreviousTurnChanges().errorMessage).not.toBeDefined();
			});
			test('moves to the next turn before initiative has started', function () {
				const initiative = InitiativeFactory.build({
					currentRound: 1,
					currentTurnGroupId: null,
				});
				const { actors, groups, firstGroup, secondGroup, thirdGroup } =
					setupInitiativeActorsAndGroupsForTests(initiative);

				const builder = new initiativeUtils.InitiativeBuilder({
					initiative,
					actors,
					groups,
				});

				expect(builder.getNextTurnChanges().currentTurnGroupId).toBe(firstGroup.id);
				expect(builder.getNextTurnChanges().currentRound).toBe(1);
				expect(builder.getNextTurnChanges().errorMessage).not.toBeDefined();
			});
			test('moves to the next turn after initiative has started', function () {
				const initiative = InitiativeFactory.build({
					currentRound: 1,
					currentTurnGroupId: null,
				});
				const { actors, groups, firstGroup, secondGroup, thirdGroup } =
					setupInitiativeActorsAndGroupsForTests(initiative);
				initiative.currentTurnGroupId = secondGroup.id;

				const builder = new initiativeUtils.InitiativeBuilder({
					initiative,
					actors,
					groups,
				});

				expect(builder.getNextTurnChanges().currentTurnGroupId).toBe(thirdGroup.id);
				expect(builder.getNextTurnChanges().currentRound).toBe(1);
				expect(builder.getNextTurnChanges().errorMessage).not.toBeDefined();
			});
			test('moves to the next round on the last turn in a round', function () {
				const initiative = InitiativeFactory.build({
					currentRound: 1,
					currentTurnGroupId: null,
				});
				const { actors, groups, firstGroup, secondGroup, thirdGroup } =
					setupInitiativeActorsAndGroupsForTests(initiative);
				initiative.currentTurnGroupId = thirdGroup.id;

				const builder = new initiativeUtils.InitiativeBuilder({
					initiative,
					actors,
					groups,
				});

				expect(builder.getNextTurnChanges().currentRound).toBe(2);
				expect(builder.getNextTurnChanges().currentTurnGroupId).toBe(firstGroup.id);
				expect(builder.getNextTurnChanges().errorMessage).not.toBeDefined();
			});
		});
		describe('removeActor', function () {
			test('does nothing when the actor is not in the initiative', async function () {
				const initiative = InitiativeFactory.build({
					currentRound: 1,
					currentTurnGroupId: null,
				});
				const { actors, groups, firstGroup, secondGroup, thirdGroup } =
					setupInitiativeActorsAndGroupsForTests(initiative);

				const builder = new initiativeUtils.InitiativeBuilder({
					initiative,
					actors,
					groups,
				});
				const turn = await KoboldEmbed.roundFromInitiativeBuilder(builder).toJSON();

				builder.removeActor(InitiativeActorFactory.build());

				const updatedTurn = await KoboldEmbed.roundFromInitiativeBuilder(builder).toJSON();
				expect(turn).toMatchObject(updatedTurn);
			});
			test('removes an actor from the initiative', async function () {
				const initiative = InitiativeFactory.build({
					currentRound: 1,
					currentTurnGroupId: null,
				});
				const { actors, groups, firstGroup, secondGroup, thirdGroup } =
					setupInitiativeActorsAndGroupsForTests(initiative);

				const builder = new initiativeUtils.InitiativeBuilder({
					initiative,
					actors,
					groups,
				});

				builder.removeActor(actors[0]);

				expect(builder.actorsByGroup[actors[0].initiativeActorGroupId] || []).not.toContain(
					actors[0]
				);
				expect(
					builder.groups.find(group => group.id === actors[0].initiativeActorGroupId)
				).toBeFalsy();
			});
			test("Doesn't update the current turn", function () {
				const initiative = InitiativeFactory.build({
					currentRound: 1,
					currentTurnGroupId: null,
				});
				const { actors, groups, firstGroup, secondGroup, thirdGroup } =
					setupInitiativeActorsAndGroupsForTests(initiative);
				initiative.currentTurnGroupId = actors[0].initiativeActorGroupId;

				const builder = new initiativeUtils.InitiativeBuilder({
					initiative,
					actors,
					groups,
				});

				builder.removeActor(actors[0]);

				expect(builder.init.currentRound).toBe(1);
				expect(builder.init.currentTurnGroupId).toBe(actors[0].initiativeActorGroupId);
			});
		});
		describe('getActorGroupTurnText', function () {
			test('returns the text for a group with one actor', function () {
				const initiative = InitiativeFactory.build({
					currentRound: 1,
					currentTurnGroupId: null,
				});
				const { actors, groups, firstGroup, secondGroup, thirdGroup } =
					setupInitiativeActorsAndGroupsForTests(initiative);

				const builder = new initiativeUtils.InitiativeBuilder({
					initiative,
					actors,
					groups,
				});

				expect(builder.getActorGroupTurnText(firstGroup)).toContain(firstGroup.name);
				expect(builder.getActorGroupTurnText(firstGroup)).toContain(
					firstGroup.initiativeResult + ''
				);
			});
			test('returns the text for a group with multiple actors', function () {
				const initiative = InitiativeFactory.build({
					currentRound: 1,
					currentTurnGroupId: null,
				});
				const { actors, groups, firstGroup, secondGroup, thirdGroup } =
					setupInitiativeActorsAndGroupsForTests(initiative);
				actors[1].initiativeActorGroupId = secondGroup.id;
				actors[2].initiativeActorGroupId = secondGroup.id;

				const builder = new initiativeUtils.InitiativeBuilder({
					initiative,
					actors,
					groups,
				});

				const turnText = builder.getActorGroupTurnText(secondGroup);
				expect(turnText).toContain(secondGroup.name);
				expect(turnText).toContain(secondGroup.initiativeResult + '');
				expect(turnText).toContain(actors[1].name);
				expect(turnText).toContain(actors[2].name);
			});
			test('still returns a result for a group with no actors', function () {
				const initiative = InitiativeFactory.build({
					currentRound: 1,
					currentTurnGroupId: null,
				});
				const { actors, groups, firstGroup, secondGroup, thirdGroup } =
					setupInitiativeActorsAndGroupsForTests(initiative);

				const builder = new initiativeUtils.InitiativeBuilder({
					initiative,
					actors,
					groups,
				});
				const extraGroup = InitiativeActorGroupFactory.build();
				expect(builder.getActorGroupTurnText(extraGroup)).toContain(extraGroup.name);
			});
		});
		describe('activeGroup', function () {
			test('returns the active group', function () {
				const initiative = InitiativeFactory.build({
					currentRound: 1,
					currentTurnGroupId: null,
				});
				const { actors, groups, firstGroup, secondGroup, thirdGroup } =
					setupInitiativeActorsAndGroupsForTests(initiative);
				initiative.currentTurnGroupId = firstGroup.id;

				const builder = new initiativeUtils.InitiativeBuilder({
					initiative,
					actors,
					groups,
				});
				expect(builder.activeGroup).toBe(firstGroup);
			});
			test('returns a falsy value if there is no active group', function () {
				const initiative = InitiativeFactory.build({
					currentRound: 1,
					currentTurnGroupId: null,
				});
				const { actors, groups, firstGroup, secondGroup, thirdGroup } =
					setupInitiativeActorsAndGroupsForTests(initiative);

				const builder = new initiativeUtils.InitiativeBuilder({
					initiative,
					actors,
					groups,
				});
				expect(builder.activeGroup).toBeFalsy();
			});
		});
		describe('getCurrentRoundMessage', function () {
			test('returns the current round message', function () {
				const initiative = InitiativeFactory.build({
					currentRound: 1,
					currentTurnGroupId: null,
				});
				initiative.roundMessageIds = ['first', 'second', 'third'];
				const { actors, groups, firstGroup, secondGroup, thirdGroup } =
					setupInitiativeActorsAndGroupsForTests(initiative);

				const builder = new initiativeUtils.InitiativeBuilder({
					initiative,
					actors,
					groups,
				});
				const fakeIntr = {
					channel: {
						messages: {
							fetch(targetMessageId) {
								return 'success! ' + targetMessageId;
							},
						},
					},
				};
				expect(
					builder.getCurrentRoundMessage(fakeIntr as any as CommandInteraction)
				).resolves.toContain('success! ' + 'second');
			});
			test('returns null if there is no current round message', function () {
				const initiative = InitiativeFactory.build({
					currentRound: 1,
					currentTurnGroupId: null,
				});
				initiative.roundMessageIds = [];
				const { actors, groups, firstGroup, secondGroup, thirdGroup } =
					setupInitiativeActorsAndGroupsForTests(initiative);

				const builder = new initiativeUtils.InitiativeBuilder({
					initiative,
					actors,
					groups,
				});
				const fakeIntr = {};
				expect(
					builder.getCurrentRoundMessage(fakeIntr as any as CommandInteraction)
				).resolves.toBeNull();
			});
		});
	});
	describe('getInitiativeForChannel', function () {
		beforeAll(async function () {
			await Initiative.query().delete().where({ channelId: 'testChannelId' });
			return await InitiativeFactory.create({ channelId: 'testChannelId' });
		});
		test('returns the initiative for the channel', async function () {
			const result = await initiativeUtils.getInitiativeForChannel({
				id: 'testChannelId',
			} as any);
			expect(result).toBeTruthy();
		});
		test('returns null if there is no initiative for the channel', async function () {
			const result = await initiativeUtils.getInitiativeForChannel({
				id: 'nonexistentChannelId',
			} as any);
			expect(result.errorMessage).toBeTruthy();
		});
		test('returns an error message if a channel is not provided', async function () {
			const result = await initiativeUtils.getInitiativeForChannel(null as any);
			expect(result.errorMessage).toBeTruthy();
		});
		afterAll(async function () {
			await Initiative.query().delete().where({ channelId: 'testChannelId' });
		});
	});
	describe('updateInitiativeRoundMessageOrSendNew', function () {});
	describe('getControllableInitiativeActors', function () {});
	describe('getControllableInitiativeGroups', function () {});
	describe('getActiveCharacterActor', function () {});
	describe('nameMatchGeneric', function () {});
	describe('getNameMatchCharacterFromInitiative', function () {});
	describe('getNameMatchGroupFromInitiative', function () {});
});
