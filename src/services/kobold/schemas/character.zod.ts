import { z } from 'zod';
import { zTimestamp } from './lib/helpers.zod.js';
import { zAction } from '../lib/schemas/action.zod.js';
import { zModifier } from '../lib/schemas/modifier.zod.js';
import { zRollMacro } from '../lib/schemas/roll-macro.zod.js';
import { zSheet } from '../lib/schemas/sheet.zod.js';
import { getDefaultSheet } from '../lib/sheet-default.js';

export type Character = z.infer<typeof zCharacter>;
export const zCharacter = z
	.strictObject({
		id: z.number().int().describe('The id of the character record.'),
		name: z.string().describe('The name of the character.'),
		charId: z.number().int().nullable().describe("The external wanderer's guide character id."),
		userId: z.string().describe('The discord id of the user who imported the character'),
		trackerMessageId: z
			.string()
			.nullable()
			.default(null)
			.describe("The discord id of message set to track this character's stats."),
		trackerChannelId: z
			.string()
			.nullable()
			.default(null)
			.describe(
				"The discord id of the channel containing the message set to track this character's stats."
			),
		trackerGuildId: z
			.string()
			.nullable()
			.default(null)
			.describe(
				"The discord id of the guild with the channel set to track this character's stats."
			),
		trackerMode: z
			.enum(['counters_only', 'basic_stats', 'full_sheet'])
			.default('full_sheet')
			.describe(
				"The mode of the tracker message. Either counters_only', 'basic_stats', or 'full_sheet."
			),
		isActiveCharacter: z
			.boolean()
			.default(false)
			.describe(
				"Whether this is the active character for the user's character based commands"
			),
		importSource: z.string().describe('What source website this character was imported from.'),
		createdAt: zTimestamp.describe('When the character was first imported'),
		lastUpdatedAt: zTimestamp.describe('When the character was last updated'),
		actions: z.array(zAction).default([]),
		modifiers: z.array(zModifier).default([]),
		rollMacros: z.array(zRollMacro).default([]),
		sheet: zSheet.default(zSheet.parse(getDefaultSheet())),
	})
	.describe('An imported character');
