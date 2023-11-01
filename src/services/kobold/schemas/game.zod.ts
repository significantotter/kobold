import { z } from 'zod';

export type Game = z.infer<typeof zGame>;
export const zGame = z
	.strictObject({
		id: z.number().int().describe('The id of the game.'),
		gmUserId: z.string().describe('The discord id of the GM of the game.'),
		name: z.string().describe('The name of the game.'),
		isActive: z.boolean().describe("Whether the game is the gm's active game on the server"),
		guildId: z.string().describe('The discord guild id of the game.'),
		createdAt: z.string().describe('When the initiative was first started'),
		lastUpdatedAt: z.string().describe('When the initiative was last interacted with'),
	})
	.describe('A group of characters led by a GM, allowing the GM access to character rolls.');
