import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { zCharacterV1 } from './character.v1.zod.js';
import { upgradeSheet } from './sheet-v2-upgrader.js';
import { zSheet } from '../../services/kobold/index.js';

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

function parseOldCharacterData(data: any) {
	const asCharacter = {
		sheet: JSON.parse(data.sheet),
		name: data.name,
		importSource: data.import_source,
		attributes: JSON.parse(data.attributes),
		customAttributes: JSON.parse(data.custom_attributes),
		modifiers: JSON.parse(data.modifiers),
		actions: JSON.parse(data.actions),
		customActions: JSON.parse(data.custom_actions),
		trackerMessageId: data.tracker_message_id,
		trackerChannelId: data.tracker_channel_id,
		trackerGuildId: data.tracker_guild_id,
		trackerMode: data.tracker_mode,
		rollMacros: JSON.parse(data.roll_macros),
		userId: data.user_id,
		charId: Number(data.char_id),
		isActiveCharacter: data.is_active_character.toLowerCase() == 'true',
		characterData: JSON.parse(data.character_data),
		calculatedStats: JSON.parse(data.calculated_stats),
		createdAt: new Date(data.created_at).toISOString(),
		lastUpdatedAt: new Date(data.last_updated_at).toISOString(),
		id: Number(data.id),
	};
	const parsed = zCharacterV1.safeParse(asCharacter);
	if (!parsed.success) {
		console.dir(asCharacter, { depth: null });
		console.dir(parsed.error.format(), { depth: null });
		throw new Error();
	}
	return parsed.data;
}

test('character.v1.zod', () => {
	//it parses old character data properly
	expect(() => {
		for (const record of records) {
			const parsed = parseOldCharacterData(record);
		}
	}).not.toThrow();
});

test('all old sheets are upgraded without error', () => {
	expect(() => {
		for (const record of records) {
			const parsed = parseOldCharacterData(record);
			const upgraded = upgradeSheet(parsed.sheet);
			zSheet.parse(upgraded);
		}
	}).not.toThrow();
});
