import { z } from 'zod';

export type InitiativeActorGroup = z.infer<typeof zInitiativeActorGroup>;
export const zInitiativeActorGroup = z
	.strictObject({
		id: z.number().int().describe('The id of the initiative actor.'),
		initiativeId: z.number().describe('The id of the initiative the actor belongs to.'),
		userId: z.string().describe('The discord id of the user who controls the group'),
		name: z.string().describe('the name of the group of actors'),
		initiativeResult: z.number().describe('The initiative result value for the group'),
		createdAt: z.string().describe('When the initiative was first started').optional(),
		lastUpdatedAt: z
			.string()
			.describe('When the initiative was last interacted with')
			.optional(),
	})
	.describe('An actor group taking part in an initiative');
