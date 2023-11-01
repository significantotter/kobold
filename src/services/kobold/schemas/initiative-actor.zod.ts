import { z } from 'zod';
import { getDefaultSheet } from '../lib/sheet-default.js';
import { zSheet } from './shared/sheet.zod.js';

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
			.number()
			.nullable()
			.describe('The id of the character that this actor represents')
			.default(null),
		referenceNpcName: z
			.string()
			.nullable()
			.describe('The name of the npc that this actor represents')
			.default(null),
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
