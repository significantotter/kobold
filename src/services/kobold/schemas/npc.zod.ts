import { z } from 'zod';
import { getDefaultSheet, zSheet } from '../models/index.js';

export type Npc = z.infer<typeof zNpc>;
export const zNpc = z
	.strictObject({
		id: z.number().int().describe('The id of the npc record.'),
		data: z.object({}).catchall(z.any()).describe('The pf2etools json data of the npc.'),
		name: z.string().describe('The name of the npc.'),
		fluff: z.object({}).catchall(z.any()).describe('The fluff data of the npc.').optional(),
		referenceNpcName: z
			.string()
			.describe("The name of the npc that serves as the source for this npc's statistics."),
		sourceFileName: z
			.string()
			.describe('The name of the source file that the npc was imported from.'),
		createdAt: z.string().describe('When the character was first imported').optional(),
		lastUpdatedAt: z.string().describe('When the character was last updated').optional(),
		sheet: zSheet.default(() => getDefaultSheet()),
	})
	.describe('A pathfinder npc from the bestiary');