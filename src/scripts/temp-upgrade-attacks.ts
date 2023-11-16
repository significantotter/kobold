import { z } from 'zod';
import { Config } from '../config/config.js';
import { getDialect } from '../services/db.dialect.js';
import { zAction, zModifier, zSheet } from '../services/kobold/index.js';
import { Kobold } from '../services/kobold/kobold.model.js';
import { zActionV1, zModifierV1, zSheetV1 } from './data-upgrade/character.v1.zod.js';
import {
	upgradeAction,
	upgradeAttack,
	upgradeModifier,
	upgradeSheet,
} from './data-upgrade/sheet-v2-upgrader.js';
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
			const upgradedSheet = {
				...record.sheet,
				attacks: record.sheet.attacks.map(upgradeAttack),
			};
			const upgradedSheetParsed = zSheet.safeParse(upgradedSheet);
			if (!upgradedSheetParsed.success) {
				console.dir(upgradedSheetParsed.error, { depth: null });
				throw new Error(`Failed to parse upgraded sheet ${record.id}`);
			}
			record.sheet = upgradedSheet;
		}

		await trx
			.insertInto('sheetRecord')
			.values(
				total.map(record => ({
					id: record.id,
					sheet: record.sheet,
				}))
			)
			.onConflict(oc =>
				oc.column('id').doUpdateSet(eb => ({
					sheet: eb.ref('excluded.sheet'),
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
