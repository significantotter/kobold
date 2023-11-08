import { z } from 'zod';

export type Initiative = z.infer<typeof zInitiative>;
export const zInitiative = z
	.strictObject({
		id: z.number().int().describe('The id of the initiative.'),
		channelId: z.string().describe('The id of the channel initiative is taking place in.'),
		gmUserId: z.string().describe('The discord id of the user who started the initiative'),
		currentTurnGroupId: z.number().nullable().describe('The id of the group whose turn it is'),
		currentRound: z.number().describe('The current round number'),
		createdAt: z.string().describe('When the initiative was first started').optional(),
		lastUpdatedAt: z
			.string()
			.describe('When the initiative was last interacted with')
			.optional(),
	})
	.describe('A character');
