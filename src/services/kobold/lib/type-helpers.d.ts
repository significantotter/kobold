export type InitWithActorsAndGroups = InitiativeModel & {
	actors: (InitiativeActor & { character: Character })[];
	actorGroups: InitiativeActorGroup[];
};

export type ModelWithSheet = Character | InitiativeActor | Npc;
