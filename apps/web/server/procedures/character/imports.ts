import { ImportSourceEnum } from '@kobold/db';
import { z } from 'zod';
import { convertWgV4ExportToSheet, type WgV4Export } from '@kobold/sheet';
import { orpc, requireAuth, preserveSheetTrackerValues, fetchPathbuilderSheet, assertUniqueCharacterName, recomputeAdjustedSheetForSheetRecord, zWgV4Import, zPathbuilderImport } from './shared.js';

function jsonByteLength(value: unknown): number {
	return Buffer.byteLength(JSON.stringify(value));
}

function logCharacterImportTiming(
	event: string,
	data: Record<string, unknown>
): void {
	console.info('[character import timing]', { event, ...data });
}

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
		const totalStart = Date.now();
		requireAuth(context.userId);
		const userId = context.userId;

		const { exportData } = input;
		const payloadMeasureStart = Date.now();
		const payloadBytes = jsonByteLength(exportData);
		const rawDataDumpBytes = jsonByteLength(exportData.content?.raw_data_dump ?? null);
		const historyBytes = jsonByteLength(exportData.content?.raw_data_dump?.history ?? null);
		logCharacterImportTiming('wg import start', {
			characterId: exportData.character?.id,
			characterName: exportData.character?.name,
			payloadBytes,
			rawDataDumpBytes,
			historyBytes,
			payloadMeasureMs: Date.now() - payloadMeasureStart,
		});

		if (exportData.version !== 4) {
			throw new Error(
				`Unsupported WG export version: ${exportData.version}. Only version 4 is supported.`
			);
		}

		const convertStart = Date.now();
		const sheet = convertWgV4ExportToSheet(exportData as WgV4Export);
		logCharacterImportTiming('wg import converted sheet', {
			characterId: exportData.character?.id,
			sheetBytes: jsonByteLength(sheet),
			durationMs: Date.now() - convertStart,
		});

		const duplicateStart = Date.now();
		const existing = await context.kobold.character.readLite({
			exactName: sheet.staticInfo.name,
			userId,
		});
		logCharacterImportTiming('wg import duplicate check', {
			characterId: exportData.character?.id,
			foundExisting: !!existing,
			durationMs: Date.now() - duplicateStart,
		});
		if (existing) {
			throw new Error(
				`You already have a character named "${sheet.staticInfo.name}". ` +
					`Please rename or delete the existing character first.`
			);
		}

		const characterName = sheet.staticInfo.name;

		const transactionStart = Date.now();
		const { characterId } = await context.kobold.transaction(async trx => {
			const sheetRecordStart = Date.now();
			const sheetRecord = await trx.sheetRecord.create({ sheet });
			logCharacterImportTiming('wg import created sheet record', {
				characterId: exportData.character?.id,
				sheetRecordId: sheetRecord.id,
				durationMs: Date.now() - sheetRecordStart,
			});

			const characterStart = Date.now();
			const { id: createdCharacterId } = await trx.character.createReturningId({
				name: characterName,
				userId,
				sheetRecordId: sheetRecord.id,
				importSource: ImportSourceEnum.wg,
				charId: exportData.character.id ?? -1,
			});
			logCharacterImportTiming('wg import created character', {
				characterId: exportData.character?.id,
				createdCharacterId,
				durationMs: Date.now() - characterStart,
			});

			const activeStart = Date.now();
			await trx.character.setIsActive(
				{
					id: createdCharacterId,
					userId,
				},
				trx.db
			);
			logCharacterImportTiming('wg import set active', {
				characterId: exportData.character?.id,
				createdCharacterId,
				durationMs: Date.now() - activeStart,
			});

			return { characterId: createdCharacterId };
		});
		logCharacterImportTiming('wg import transaction complete', {
			characterId: exportData.character?.id,
			createdCharacterId: characterId,
			durationMs: Date.now() - transactionStart,
		});
		logCharacterImportTiming('wg import complete', {
			characterId: exportData.character?.id,
			createdCharacterId: characterId,
			durationMs: Date.now() - totalStart,
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
		const totalStart = Date.now();
		requireAuth(context.userId);

		const { characterId, exportData } = input;
		const payloadMeasureStart = Date.now();
		logCharacterImportTiming('wg update start', {
			characterId: exportData.character?.id,
			targetCharacterId: characterId,
			characterName: exportData.character?.name,
			payloadBytes: jsonByteLength(exportData),
			rawDataDumpBytes: jsonByteLength(exportData.content?.raw_data_dump ?? null),
			historyBytes: jsonByteLength(exportData.content?.raw_data_dump?.history ?? null),
			payloadMeasureMs: Date.now() - payloadMeasureStart,
		});

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

		const convertStart = Date.now();
		let sheet = convertWgV4ExportToSheet(exportData as WgV4Export);
		sheet = preserveSheetTrackerValues(sheet, existingSheetRecord.sheet);
		logCharacterImportTiming('wg update converted sheet', {
			characterId: exportData.character?.id,
			targetCharacterId: characterId,
			sheetBytes: jsonByteLength(sheet),
			durationMs: Date.now() - convertStart,
		});
		const newName = sheet.staticInfo.name;
		const newCharId = exportData.character.id ?? existing.charId;

		const uniqueStart = Date.now();
		await assertUniqueCharacterName({
			context,
			userId: context.userId,
			name: newName,
			excludeCharacterId: characterId,
		});
		logCharacterImportTiming('wg update unique name check', {
			characterId: exportData.character?.id,
			targetCharacterId: characterId,
			durationMs: Date.now() - uniqueStart,
		});

		const updateSheetStart = Date.now();
		await context.kobold.sheetRecord.update({ id: existing.sheetRecordId }, { sheet });
		logCharacterImportTiming('wg update sheet record', {
			characterId: exportData.character?.id,
			targetCharacterId: characterId,
			sheetRecordId: existing.sheetRecordId,
			durationMs: Date.now() - updateSheetStart,
		});
		const recomputeStart = Date.now();
		await recomputeAdjustedSheetForSheetRecord({
			context,
			sheetRecordId: existing.sheetRecordId,
		});
		logCharacterImportTiming('wg update recompute adjusted sheet', {
			characterId: exportData.character?.id,
			targetCharacterId: characterId,
			sheetRecordId: existing.sheetRecordId,
			durationMs: Date.now() - recomputeStart,
		});

		if (newName !== existing.name || newCharId !== existing.charId) {
			const characterUpdateStart = Date.now();
			await context.kobold.character.updateFields(
				{ id: characterId },
				{ name: newName, charId: newCharId }
			);
			logCharacterImportTiming('wg update character fields', {
				characterId: exportData.character?.id,
				targetCharacterId: characterId,
				durationMs: Date.now() - characterUpdateStart,
			});
		}
		logCharacterImportTiming('wg update complete', {
			characterId: exportData.character?.id,
			targetCharacterId: characterId,
			durationMs: Date.now() - totalStart,
		});

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
