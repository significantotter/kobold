import { z } from 'zod';
import { getDefaultSheet, zSheet } from '../models/index.js';

export type InitiativeActor = z.infer<typeof zInitiativeActor>;
export const zInitiativeActor = z
	.strictObject({
		id: z.number().int().describe('The id of the initiative actor.'),
		initiativeId: z.number().describe('The id of the initiative the actor belongs to.'),
		initiativeActorGroupId: z
			.number()
			.describe('The id of the initiative actor group the actor belongs to.'),
		userId: z.string().describe('The discord id of the user who controls the actor'),
		characterId: z
			.union([
				z.number().describe('The id of the character that this actor represents'),
				z.null().describe('The id of the character that this actor represents'),
			])
			.describe('The id of the character that this actor represents')
			.optional(),
		referenceNpcName: z
			.union([
				z.string().describe('The name of the npc that this actor represents'),
				z.null().describe('The name of the npc that this actor represents'),
			])
			.describe('The name of the npc that this actor represents')
			.optional(),
		name: z.string().describe('the name of the actor'),
		hideStats: z
			.boolean()
			.describe(
				'Whether or not to hide the stats of this actor in channel initiative displays'
			),
		createdAt: z.string().describe('When the initiative was first started').optional(),
		lastUpdatedAt: z
			.string()
			.describe('When the initiative was last interacted with')
			.optional(),
		sheet: zSheet.default(() => getDefaultSheet()),
	})
	.describe('An actor taking part in an initiative');
