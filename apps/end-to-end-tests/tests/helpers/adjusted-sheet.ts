import { expect } from '@playwright/test';
import { Config } from '@kobold/config';
import type { CharacterBasic, Sheet, SheetRecord } from '@kobold/db';
import { kobold } from '../db.js';

export const E2E_CHARACTER_NAME = 'E2E Test Character';
const USER_ID = Config.e2e?.userId ?? '';
const CHANNEL_ID = Config.e2e?.channelId ?? '';

function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export function characterCreateForValue(character: Pick<CharacterBasic, 'sheetRecordId'>) {
	return `character:${character.sheetRecordId}`;
}

export function signed(value: number | null | undefined) {
	const normalized = value ?? 0;
	return normalized >= 0 ? `+${normalized}` : `${normalized}`;
}

export async function getE2ECharacter(): Promise<CharacterBasic> {
	const character = await kobold.character.readLite({
		userId: USER_ID,
		exactName: E2E_CHARACTER_NAME,
	});
	if (!character) throw new Error(`Could not find ${E2E_CHARACTER_NAME}`);
	return character;
}

export async function getFullSheetRecord(sheetRecordId: number): Promise<SheetRecord> {
	const sheetRecord = await kobold.sheetRecord.readFull({ id: sheetRecordId });
	if (!sheetRecord) throw new Error(`Could not find sheet record ${sheetRecordId}`);
	return sheetRecord;
}

export async function waitForSheetRecord(
	sheetRecordId: number,
	predicate: (sheetRecord: SheetRecord) => boolean,
	{ timeoutMs = 10_000, intervalMs = 250 } = {}
): Promise<SheetRecord> {
	const deadline = Date.now() + timeoutMs;
	let latest = await getFullSheetRecord(sheetRecordId);

	while (Date.now() < deadline) {
		latest = await getFullSheetRecord(sheetRecordId);
		if (predicate(latest)) return latest;
		await sleep(intervalMs);
	}

	throw new Error(
		`Timed out waiting for sheet record ${sheetRecordId}. Latest sheet: ${JSON.stringify({
			baseAc: latest.sheet.intProperties.ac,
			adjustedAc: latest.adjustedSheet.intProperties.ac,
			baseHp: latest.sheet.baseCounters.hp,
			adjustedHp: latest.adjustedSheet.baseCounters.hp,
		})}`
	);
}

export async function resetAdjustedSheetToBase(sheetRecordId: number): Promise<void> {
	const sheetRecord = await getFullSheetRecord(sheetRecordId);
	await kobold.sheetRecord.update({ id: sheetRecordId }, { adjustedSheet: sheetRecord.sheet });
}

export async function cleanupModifiersByName(...names: string[]): Promise<void> {
	const normalizedNames = names.map(name => name.toLowerCase());
	if (normalizedNames.length === 0) return;

	const character = await getE2ECharacter();
	await kobold.db
		.deleteFrom('modifier')
		.where('userId', '=', USER_ID)
		.where('name', 'in', normalizedNames)
		.execute();
	await resetAdjustedSheetToBase(character.sheetRecordId);
}

export async function cleanupRollMacrosByName(...names: string[]): Promise<void> {
	const normalizedNames = names.map(name => name.toLowerCase());
	if (normalizedNames.length === 0) return;

	await kobold.db
		.deleteFrom('rollMacro')
		.where('userId', '=', USER_ID)
		.where('name', 'in', normalizedNames)
		.execute();
}

export async function cleanupConditionsByName(...names: string[]): Promise<void> {
	const normalizedNames = new Set(names.map(name => name.toLowerCase()));
	if (normalizedNames.size === 0) return;

	const character = await getE2ECharacter();
	const sheetRecord = await getFullSheetRecord(character.sheetRecordId);
	await kobold.sheetRecord.update(
		{ id: character.sheetRecordId },
		{
			conditions: sheetRecord.conditions.filter(
				condition => !normalizedNames.has(condition.name.toLowerCase())
			),
			adjustedSheet: sheetRecord.sheet,
		}
	);
}

export async function restoreHpCurrentToMax(sheetRecordId: number): Promise<void> {
	const sheetRecord = await getFullSheetRecord(sheetRecordId);
	const sheet: Sheet = structuredClone(sheetRecord.sheet);
	sheet.baseCounters.hp.current = sheet.baseCounters.hp.max ?? sheet.baseCounters.hp.current;
	await kobold.sheetRecord.updateSheetAndMirrorAdjustedCurrentValues(
		{ id: sheetRecordId },
		{ sheet }
	);
}

export async function expectCurrentMirrored(
	sheetRecordId: number,
	currentHp: number
): Promise<void> {
	const sheetRecord = await waitForSheetRecord(
		sheetRecordId,
		record =>
			record.sheet.baseCounters.hp.current === currentHp &&
			record.adjustedSheet.baseCounters.hp.current === currentHp
	);
	expect(sheetRecord.sheet.baseCounters.hp.current).toBe(currentHp);
	expect(sheetRecord.adjustedSheet.baseCounters.hp.current).toBe(currentHp);
}

export async function cleanupE2EInitiatives(): Promise<void> {
	await kobold.db.transaction().execute(async trx => {
		const initiatives = await trx
			.selectFrom('initiative')
			.select('id')
			.where('channelId', '=', CHANNEL_ID)
			.where('gmUserId', '=', USER_ID)
			.execute();
		const initiativeIds = initiatives.map(initiative => initiative.id);
		if (initiativeIds.length === 0) return;

		await trx
			.deleteFrom('initiativeActor')
			.where('initiativeId', 'in', initiativeIds)
			.execute();
		await trx
			.deleteFrom('initiativeActorGroup')
			.where('initiativeId', 'in', initiativeIds)
			.execute();
		await trx.deleteFrom('initiative').where('id', 'in', initiativeIds).execute();
	});
}
