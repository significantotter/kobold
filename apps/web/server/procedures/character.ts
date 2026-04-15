import { os } from '@orpc/server';
import { z } from 'zod';
import { ImportSourceEnum } from '@kobold/db';
import { convertWgV4ExportToSheet, type WgV4Export } from '@kobold/sheet';
import type { Sheet, SheetBaseCounterKeys } from '@kobold/schema';
import type { AppContext } from '../context.js';

const orpc = os.$context<AppContext>();

const zWgV4Import = z.object({
	version: z.number(),
	character: z.record(z.string(), z.any()),
	content: z.record(z.string(), z.any()),
});

function requireAuth(userId: string | null): asserts userId is string {
	if (!userId) {
		throw new Error('You must be logged in to perform this action.');
	}
}

/**
 * Copies current counter values and custom counter groups from an old sheet to a new one,
 * clamping values to the new max where applicable.
 */
function preserveSheetTrackerValues(newSheet: Sheet, oldSheet: Sheet): Sheet {
	for (const key in newSheet.baseCounters) {
		const k = key as SheetBaseCounterKeys;
		newSheet.baseCounters[k].current =
			oldSheet.baseCounters[k].current ?? newSheet.baseCounters[k].current;
		if (newSheet.baseCounters[k].max !== null) {
			newSheet.baseCounters[k].current = Math.min(
				newSheet.baseCounters[k].current,
				newSheet.baseCounters[k].max!
			);
		}
	}
	newSheet.counterGroups = oldSheet.counterGroups;
	newSheet.countersOutsideGroups = oldSheet.countersOutsideGroups;
	return newSheet;
}

export const characterRouter = orpc.router({
	getCharacterLite: orpc
		.input(
			z.object({
				characterId: z.number(),
			})
		)
		.output(
			z
				.object({
					id: z.number(),
					name: z.string(),
					importSource: z.string(),
					isActiveCharacter: z.boolean(),
				})
				.nullable()
		)
		.handler(async ({ input, context }) => {
			requireAuth(context.userId);

			const character = await context.kobold.character.readLite({
				id: input.characterId,
				userId: context.userId,
			});
			if (!character) return null;

			return {
				id: character.id,
				name: character.name,
				importSource: character.importSource as string,
				isActiveCharacter: character.isActiveCharacter,
			};
		}),

	getCharacter: orpc
		.input(
			z.object({
				characterId: z.number(),
			})
		)
		.output(
			z
				.object({
					id: z.number(),
					name: z.string(),
					importSource: z.string(),
					level: z.number().nullable(),
				})
				.nullable()
		)
		.handler(async ({ input, context }) => {
			requireAuth(context.userId);

			const character = await context.kobold.character.readLite({
				id: input.characterId,
				userId: context.userId,
			});
			if (!character) return null;

			const sheetRecord = await context.kobold.sheetRecord.read({
				id: character.sheetRecordId,
			});

			return {
				id: character.id,
				name: character.name,
				importSource: character.importSource as string,
				level: sheetRecord?.sheet.staticInfo.level ?? null,
			};
		}),

	findWgCharacterByName: orpc
		.input(
			z.object({
				name: z.string(),
			})
		)
		.output(
			z
				.object({
					id: z.number(),
					name: z.string(),
				})
				.nullable()
		)
		.handler(async ({ input, context }) => {
			requireAuth(context.userId);

			const characters = await context.kobold.character.readManyLite({
				name: input.name,
				userId: context.userId,
				importSource: ImportSourceEnum.wg,
			});
			if (!characters.length) return null;

			return {
				id: characters[0].id,
				name: characters[0].name,
			};
		}),

	importWgCharacter: orpc
		.input(
			z.object({
				exportData: zWgV4Import,
			})
		)
		.output(
			z.object({
				characterId: z.number(),
				name: z.string(),
			})
		)
		.handler(async ({ input, context }) => {
			requireAuth(context.userId);

			const { exportData } = input;

			if (exportData.version !== 4) {
				throw new Error(
					`Unsupported WG export version: ${exportData.version}. Only version 4 is supported.`
				);
			}

			const sheet = convertWgV4ExportToSheet(exportData as WgV4Export);

			// Check for duplicate character
			const existing = await context.kobold.character.readLite({
				exactName: sheet.staticInfo.name,
				userId: context.userId,
			});
			if (existing) {
				throw new Error(
					`You already have a character named "${sheet.staticInfo.name}". ` +
						`Please rename or delete the existing character first.`
				);
			}

			const characterName = sheet.staticInfo.name;

			const { characterId } = await context.kobold.transaction(async trx => {
				const sheetRecord = await trx.sheetRecord.create({ sheet });

				const { id: characterId } = await trx.character.createReturningId({
					name: characterName,
					userId: context.userId,
					sheetRecordId: sheetRecord.id,
					importSource: ImportSourceEnum.wg,
					charId: exportData.character.id ?? -1,
				});

				await trx.character.setIsActive({
					id: characterId,
					userId: context.userId,
				});

				return { characterId };
			});

			return {
				characterId,
				name: characterName,
			};
		}),

	updateWgCharacter: orpc
		.input(
			z.object({
				characterId: z.number(),
				exportData: zWgV4Import,
			})
		)
		.output(
			z.object({
				characterId: z.number(),
				name: z.string(),
			})
		)
		.handler(async ({ input, context }) => {
			requireAuth(context.userId);

			const { characterId, exportData } = input;

			if (exportData.version !== 4) {
				throw new Error(
					`Unsupported WG export version: ${exportData.version}. Only version 4 is supported.`
				);
			}

			// Verify ownership
			const existing = await context.kobold.character.readLite({
				id: characterId,
				userId: context.userId,
			});
			if (!existing) {
				throw new Error('Character not found or does not belong to you.');
			}

			const existingSheetRecord = await context.kobold.sheetRecord.read({
				id: existing.sheetRecordId,
			});
			if (!existingSheetRecord) {
				throw new Error('Character sheet record not found.');
			}

			let sheet = convertWgV4ExportToSheet(exportData as WgV4Export);

			// Preserve tracker values (HP, focus, hero points, custom counters, etc.)
			sheet = preserveSheetTrackerValues(sheet, existingSheetRecord.sheet);

			// Update the sheet record
			await context.kobold.sheetRecord.update({ id: existing.sheetRecordId }, { sheet });

			// Update character name/charId if changed
			const newName = sheet.staticInfo.name;
			const newCharId = exportData.character.id ?? existing.charId;
			if (newName !== existing.name || newCharId !== existing.charId) {
				await context.kobold.character.updateFields(
					{ id: characterId },
					{ name: newName, charId: newCharId }
				);
			}

			return {
				characterId,
				name: newName,
			};
		}),
});

export type CharacterRouter = typeof characterRouter;
