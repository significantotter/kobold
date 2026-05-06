import { ImportSourceEnum } from '@kobold/db';
import { z } from 'zod';
import { convertWgV4ExportToSheet, type WgV4Export } from '@kobold/sheet';
import { orpc, requireAuth, preserveSheetTrackerValues, fetchPathbuilderSheet, assertUniqueCharacterName, recomputeAdjustedSheetForSheetRecord, zWgV4Import, zPathbuilderImport } from './shared.js';

export const getCharacterLite = orpc
	.input(z.object({ characterId: z.number() }))
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
	});

export const getCharacter = orpc
	.input(z.object({ characterId: z.number() }))
	.output(
		z
			.object({
				id: z.number(),
				name: z.string(),
				importSource: z.string(),
				charId: z.number(),
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
			charId: character.charId,
			level: sheetRecord?.sheet.staticInfo.level ?? null,
		};
	});

export const findWgCharacterByName = orpc
	.input(z.object({ name: z.string() }))
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
	});

export const importWgCharacter = orpc
	.input(z.object({ exportData: zWgV4Import }))
	.output(z.object({ characterId: z.number(), name: z.string() }))
	.handler(async ({ input, context }) => {
		requireAuth(context.userId);
		const userId = context.userId;

		const { exportData } = input;

		if (exportData.version !== 4) {
			throw new Error(
				`Unsupported WG export version: ${exportData.version}. Only version 4 is supported.`
			);
		}

		const sheet = convertWgV4ExportToSheet(exportData as WgV4Export);

		const existing = await context.kobold.character.readLite({
			exactName: sheet.staticInfo.name,
			userId,
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

			const { id: createdCharacterId } = await trx.character.createReturningId({
				name: characterName,
				userId,
				sheetRecordId: sheetRecord.id,
				importSource: ImportSourceEnum.wg,
				charId: exportData.character.id ?? -1,
			});

			await trx.character.setIsActive(
				{
					id: createdCharacterId,
					userId,
				},
				trx.db
			);

			return { characterId: createdCharacterId };
		});

		return {
			characterId,
			name: characterName,
		};
	});

export const updateWgCharacter = orpc
	.input(z.object({ characterId: z.number(), exportData: zWgV4Import }))
	.output(z.object({ characterId: z.number(), name: z.string() }))
	.handler(async ({ input, context }) => {
		requireAuth(context.userId);

		const { characterId, exportData } = input;

		if (exportData.version !== 4) {
			throw new Error(
				`Unsupported WG export version: ${exportData.version}. Only version 4 is supported.`
			);
		}

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
		sheet = preserveSheetTrackerValues(sheet, existingSheetRecord.sheet);
		const newName = sheet.staticInfo.name;
		const newCharId = exportData.character.id ?? existing.charId;

		await assertUniqueCharacterName({
			context,
			userId: context.userId,
			name: newName,
			excludeCharacterId: characterId,
		});

		await context.kobold.sheetRecord.update({ id: existing.sheetRecordId }, { sheet });
		await recomputeAdjustedSheetForSheetRecord({
			context,
			sheetRecordId: existing.sheetRecordId,
		});

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
	});

export const importPathbuilderCharacter = orpc
	.input(zPathbuilderImport)
	.output(z.object({ characterId: z.number(), name: z.string() }))
	.handler(async ({ input, context }) => {
		requireAuth(context.userId);
		const userId = context.userId;

		const sheet = await fetchPathbuilderSheet({
			jsonId: input.jsonId,
			useStamina: input.useStamina,
		});

		const existing = await context.kobold.character.readLite({
			exactName: sheet.staticInfo.name,
			userId,
		});
		if (existing) {
			throw new Error(
				`You already have a character named "${sheet.staticInfo.name}". ` +
					'Please rename or delete the existing character first.'
			);
		}

		const characterName = sheet.staticInfo.name;
		const { characterId } = await context.kobold.transaction(async trx => {
			const sheetRecord = await trx.sheetRecord.create({ sheet });

			const { id: createdCharacterId } = await trx.character.createReturningId({
				name: characterName,
				userId,
				sheetRecordId: sheetRecord.id,
				importSource: ImportSourceEnum.pathbuilder,
				charId: input.jsonId,
			});

			await trx.character.setIsActive(
				{
					id: createdCharacterId,
					userId,
				},
				trx.db
			);

			return { characterId: createdCharacterId };
		});

		return {
			characterId,
			name: characterName,
		};
	});

export const updatePathbuilderCharacter = orpc
	.input(
		z.object({
			characterId: z.number(),
			jsonId: z.number().int().positive(),
			useStamina: z.boolean().optional().default(false),
		})
	)
	.output(z.object({ characterId: z.number(), name: z.string() }))
	.handler(async ({ input, context }) => {
		requireAuth(context.userId);

		const existing = await context.kobold.character.readLite({
			id: input.characterId,
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

		let sheet = await fetchPathbuilderSheet({
			jsonId: input.jsonId,
			useStamina: input.useStamina,
		});

		sheet.info.imageURL = existingSheetRecord.sheet.info.imageURL ?? sheet.info.imageURL;
		sheet = preserveSheetTrackerValues(sheet, existingSheetRecord.sheet);
		const newName = sheet.staticInfo.name;

		await assertUniqueCharacterName({
			context,
			userId: context.userId,
			name: newName,
			excludeCharacterId: input.characterId,
		});

		await context.kobold.sheetRecord.update({ id: existing.sheetRecordId }, { sheet });
		await recomputeAdjustedSheetForSheetRecord({
			context,
			sheetRecordId: existing.sheetRecordId,
		});

		if (newName !== existing.name || input.jsonId !== existing.charId) {
			await context.kobold.character.updateFields(
				{ id: input.characterId },
				{ name: newName, charId: input.jsonId }
			);
		}

		return {
			characterId: input.characterId,
			name: newName,
		};
	});

