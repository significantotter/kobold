import {
	InitiativeFactory,
	InitiativeActorFactory,
	InitiativeActorGroupFactory,
} from '../services/kobold/models/index.js';
import * as initiativeUtils from './initiative-utils.js';

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
		describe('removeActor', function () {});
		describe('getActorGroupTurnText', function () {});
		describe('getCurrentRoundMessage', function () {});
		describe('currentTurnEmbed', function () {});
		describe('compileEmbed', function () {});
	});
	describe('getInitiativeForChannel', function () {});
	describe('updateInitiativeRoundMessageOrSendNew', function () {});
	describe('getControllableInitiativeActors', function () {});
	describe('getControllableInitiativeGroups', function () {});
	describe('getActiveCharacterActor', function () {});
	describe('nameMatchGeneric', function () {});
	describe('getNameMatchCharacterFromInitiative', function () {});
	describe('getNameMatchGroupFromInitiative', function () {});
});
