import { z } from 'zod';
import { zCharacter } from '../character.zod.js';
import { zGame } from '../game.zod.js';
import { zInitiativeActor } from '../initiative-actor.zod.js';
import { zInitiativeActorGroup } from '../initiative-actor-group.zod.js';
import { zInitiative } from '../initiative.zod.js';

export type InitiativeActorWithRelations = z.infer<typeof zInitiativeActorWithRelations>;
export const zInitiativeActorWithRelations = zInitiativeActor.extend({
	initiative: zInitiative.optional(),
	actorGroup: zInitiativeActorGroup.optional(),
	character: zCharacter.optional(),
});
export type InitiativeWithRelations = z.infer<typeof zInitiativeWithRelations>;
export const zInitiativeWithRelations = zInitiative.extend({
	currentTurnGroup: zInitiativeActorGroup.optional(),
	actorGroups: z.array(zInitiativeActorGroup).optional(),
	actors: z.array(zInitiativeActorWithRelations).optional(),
});

export type GameWithRelations = z.infer<typeof zGameWithRelations>;
export const zGameWithRelations = zGame.extend({
	characters: z.array(zCharacter).optional(),
});
