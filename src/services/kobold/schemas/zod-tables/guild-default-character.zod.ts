import { z } from 'zod';

export type GuildDefaultCharacter = z.infer<typeof zGuildDefaultCharacter>;
export const zGuildDefaultCharacter = z
	.strictObject({
		guildId: z.string().describe('The discord id of the guild for the default character.'),
		characterId: z.number().int().describe('The internal id of the character.'),
		userId: z.string().describe('The discord id of the user who imported the character'),
	})
	.describe('A record of a character set as the default for a user in a guild');
