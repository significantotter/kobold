import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { zCharacter } from './character.zod.js';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const csv = readFileSync(join(__dirname, 'character_rows.csv'));
const records = parse(csv, {
	columns: true,
	skip_empty_lines: true,
}) as {
	[k: string]: any;
	sheet: string;
	name: string;
	import_source: string;
	attributes: string;
	custom_attributes: string;
	modifiers: string;
	actions: string;
	custom_actions: string;
	tracker_message_id: string;
	tracker_channel_id: string;
	tracker_guild_id: string;
	tracker_mode: string;
	roll_macros: string;
	user_id: string;
	char_id: string;
	is_active_character: string;
	character_data: string;
	calculated_stats: string;
	created_at: string;
	last_updated_at: string;
	id: string;
}[];

for (const record of records) {
	const asCharacter = {
		sheet: JSON.parse(record.sheet),
		name: record.name,
		importSource: record.import_source,
		attributes: JSON.parse(record.attributes),
		customAttributes: JSON.parse(record.custom_attributes),
		modifiers: JSON.parse(record.modifiers),
		actions: JSON.parse(record.actions),
		customActions: JSON.parse(record.custom_actions),
		trackerMessageId: record.tracker_message_id,
		trackerChannelId: record.tracker_channel_id,
		trackerGuildId: record.tracker_guild_id,
		trackerMode: record.tracker_mode,
		rollMacros: JSON.parse(record.roll_macros),
		userId: record.user_id,
		charId: Number(record.char_id),
		isActiveCharacter: record.is_active_character.toLowerCase() == 'true',
		characterData: JSON.parse(record.character_data),
		calculatedStats: JSON.parse(record.calculated_stats),
		createdAt: new Date(record.created_at).toISOString(),
		lastUpdatedAt: new Date(record.last_updated_at).toISOString(),
		id: Number(record.id),
	};
	const parse = zCharacter.safeParse(asCharacter);
	if (!parse.success) {
		console.dir(parse.error.format(), { depth: null });
		console.dir(asCharacter, { depth: null });
		throw new Error();
	}
}
