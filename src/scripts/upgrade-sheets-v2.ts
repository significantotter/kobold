import { z } from 'zod';
import { Config } from '../config/config.js';
import { getDialect } from '../services/db.dialect.js';
import { zAction, zModifier, zSheet } from '../services/kobold/index.js';
import { Kobold } from '../services/kobold/kobold.model.js';
import { zActionV1, zModifierV1, zSheetV1 } from './data-upgrade/character.v1.zod.js';
import { upgradeAction, upgradeModifier, upgradeSheet } from './data-upgrade/sheet-v2-upgrader.js';
import { sqlJSON } from '../services/kobold/lib/kysely-json.js';

const PostgresDialect = getDialect(Config.database.url);
const kobold = new Kobold(PostgresDialect);

await kobold.db.transaction().execute(async trx => {
	let iter = 0;
	let batchSize = 50;
	console.log(`selecting batch ${iter + 1}`);
	let total = await trx
		.selectFrom('sheetRecord')
		.selectAll()
		.offset(iter * batchSize)
		.limit(batchSize)
		.orderBy('id asc')
		.execute();
	while (total.length > 0) {
		console.log(`upgrading batch ${iter + 1}`);
		// upgrade the sheets
		for (const record of total) {
			const sheet = zSheetV1.safeParse(record.sheet);
			if (!sheet.success) {
				if (!zSheet.safeParse(record.sheet).success) {
					console.warn(sheet);
					throw new Error(`Failed to parse sheet ${record.id}`);
				} else continue;
			}
			const upgradedSheet = upgradeSheet(sheet.data);
			if (!zSheet.safeParse(upgradedSheet).success) {
				console.warn(upgradedSheet);
				throw new Error(`Failed to parse upgraded sheet ${record.id}`);
			}
			record.sheet = upgradedSheet;
		}
		//upgrade modifiers
		for (const record of total) {
			const modifiers = z.array(zModifierV1).safeParse(record.modifiers);
			if (!modifiers.success) {
				if (!z.array(zModifier).safeParse(record.modifiers).success) {
					console.warn(modifiers);
					throw new Error(`Failed to parse modifiers ${record.id}`);
				} else continue;
			}
			const upgradedModifiers = modifiers.data.map(modifier => upgradeModifier(modifier));
			const upgradedModifiersParsed = z.array(zModifier).safeParse(upgradedModifiers);
			if (!upgradedModifiersParsed.success) {
				console.warn(upgradedModifiersParsed.error);
				throw new Error(`Failed to parse upgraded modifiers ${record.id}`);
			}
			record.modifiers = upgradedModifiers;
		}
		for (const record of total) {
			const actions = z.array(zActionV1).safeParse(record.actions);
			if (!actions.success) {
				if (!z.array(zAction).safeParse(record.actions).success) {
					console.warn(actions.error);
					throw new Error(`Failed to parse action for ${record.id}`);
				} else continue;
			}
			const upgradedActions = actions.data.map(action => upgradeAction(action));
			const upgradedActionsParsed = z.array(zAction).safeParse(upgradedActions);
			if (!upgradedActionsParsed.success) {
				console.warn(upgradedActionsParsed.error);
				throw new Error(`Failed to parse upgraded action for ${record.id}`);
			}
			record.actions = upgradedActions;
		}

		await trx
			.insertInto('sheetRecord')
			.values(
				total.map(record => ({
					id: record.id,
					sheet: record.sheet,
					modifiers: sqlJSON(record.modifiers),
					actions: sqlJSON(record.actions),
				}))
			)
			.onConflict(oc =>
				oc.column('id').doUpdateSet(eb => ({
					sheet: eb.ref('excluded.sheet'),
					modifiers: eb.ref('excluded.modifiers'),
					actions: eb.ref('excluded.actions'),
				}))
			)
			.execute();

		// get next batch
		iter += 1;
		console.log(`selecting batch ${iter + 1}`);
		total = await trx
			.selectFrom('sheetRecord')
			.selectAll()
			.offset(iter * batchSize)
			.limit(batchSize)
			.orderBy('id asc')
			.execute();
	}
});
