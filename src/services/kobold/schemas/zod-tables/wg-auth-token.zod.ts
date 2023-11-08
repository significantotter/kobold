import { z } from 'zod';

export type WgAuthToken = z.infer<typeof zWgAuthToken>;
export const zWgAuthToken = z
	.strictObject({
		id: z.number().int().describe('The id of the token request.'),
		charId: z.number().int().describe("The external wanderer's guide character id."),
		accessToken: z.string().describe("the wanderer's guide oauth access token"),
		expiresAt: z.string().describe('when the token expires'),
		accessRights: z.string().describe('the rights granted for the character'),
		tokenType: z.string().describe('the OAUTH token type'),
	})
	.describe("an oauth api token for a wanderer's guide character");
