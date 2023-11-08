import { z } from 'zod';

export type ChannelDefaultCharacter = z.infer<typeof zChannelDefaultCharacter>;
export const zChannelDefaultCharacter = z
	.strictObject({
		channelId: z.string().describe('The discord id of the channel for the default character.'),
		characterId: z.number().int().describe('The internal id of the character.'),
		userId: z.string().describe('The discord id of the user who imported the character'),
	})
	.describe('A record of a character set as the default for a user in a channel');
