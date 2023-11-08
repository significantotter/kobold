import { z } from 'zod';

export type BestiaryFilesLoaded = z.infer<typeof zBestiaryFilesLoaded>;
export const zBestiaryFilesLoaded = z
	.strictObject({
		id: z.number().int().describe('The id of the character record.'),
		fileName: z.string().describe('The name of the file that was imported'),
		fileHash: z.string().describe('The most recent hash of the file that was imported'),
		createdAt: z.string().describe('When the character was first imported').optional(),
		lastUpdatedAt: z.string().describe('When the character was last updated').optional(),
	})
	.describe('The bestiary files imported into the database');
