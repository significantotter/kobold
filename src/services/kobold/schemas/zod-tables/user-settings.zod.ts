import { z } from 'zod';

export type UserSettings = z.infer<typeof zUserSettings>;
export const zUserSettings = z
	.strictObject({
		userId: z.string().describe('The discord id of the user.'),
		initStatsNotification: z
			.enum(['never', 'every_turn', 'every_round', 'whenever_hidden'])
			.describe(
				'When to notify the GM in initiative of the status of characters with hidden stats.'
			),
		rollCompactMode: z.enum(['compact', 'normal']).describe('Whether to roll in compact mode.'),
		inlineRollsDisplay: z
			.enum(['compact', 'detailed'])
			.describe('How detailed to display inline rolls.'),
	})
	.describe('The settings for a user in Kobold.');
