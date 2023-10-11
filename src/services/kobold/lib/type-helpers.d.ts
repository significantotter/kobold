import { Character } from './../models/character/character.model.js';

export type InitWithActorsAndGroups = Initiative & {
	actors: (InitiativeActor & { character: Character })[];
	actorGroups: InitiativeActorGroup[];
};
