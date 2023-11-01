import { InitiativeModel } from '../models/initiative/initiative.model.ts';
import { InitiativeActorModel } from '../models/initiative-actor/initiative-actor.model.ts';
import { CharacterModel } from '../models/character/character.model.ts';
import { NpcModel } from '../models/npc/npc.model.ts';
import { InitiativeActorGroupModel } from '../models/initiative-actor-group/initiative-actor-group.model.ts';

export type InitWithActorsAndGroups = InitiativeModel & {
	actors: (InitiativeActorModel & { character: CharacterModel })[];
	actorGroups: InitiativeActorGroupModel[];
};

export type ModelWithSheet = CharacterModel | InitiativeActorModel | NpcModel;
