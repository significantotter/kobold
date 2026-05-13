import { Kysely } from 'kysely';
import { sqlJSON } from '../lib/kysely-json.js';
import {
	Database,
	NewSheetRecord,
	Sheet,
	SheetRecord,
	SheetRecordBase,
	SheetRecordId,
	SheetRecordUpdate,
} from '../schemas/index.js';
import { Model } from './model.js';

type RuntimeCounterState = {
	current?: number;
	active?: boolean[];
	prepared?: (string | null)[];
};

type SheetCounter =
	| Sheet['baseCounters'][keyof Sheet['baseCounters']]
	| Sheet['countersOutsideGroups'][number]
	| Sheet['counterGroups'][number]['counters'][number];

function getRuntimeCounterState(counter: SheetCounter) {
	const state: RuntimeCounterState = {};
	if ('current' in counter) state.current = counter.current;
	if ('active' in counter) state.active = [...(counter.active as boolean[])];
	if ('prepared' in counter) state.prepared = [...(counter.prepared as (string | null)[])];
	return state;
}

function applyRuntimeCounterState<T extends { name: string }>(
	counter: T,
	state: RuntimeCounterState
): T {
	const next = { ...counter } as T & RuntimeCounterState;
	if (state.current !== undefined && 'current' in next) next.current = state.current;
	if (state.active !== undefined && 'active' in next) next.active = [...state.active];
	if (state.prepared !== undefined && 'prepared' in next) next.prepared = [...state.prepared];
	return next;
}

function mirrorRuntimeCounterState(source: Sheet, adjusted: Sheet): Sheet {
	const nextAdjusted = structuredClone(adjusted);

	for (const key of Object.keys(source.baseCounters) as (keyof Sheet['baseCounters'])[]) {
		nextAdjusted.baseCounters[key] = applyRuntimeCounterState(
			nextAdjusted.baseCounters[key],
			getRuntimeCounterState(source.baseCounters[key])
		);
	}

	const sourceCountersByName = new Map(
		source.countersOutsideGroups.map(counter => [counter.name, counter])
	);
	nextAdjusted.countersOutsideGroups = nextAdjusted.countersOutsideGroups.map(counter => {
		const sourceCounter = sourceCountersByName.get(counter.name);
		if (!sourceCounter || sourceCounter.style !== counter.style) return counter;
		return applyRuntimeCounterState(counter, getRuntimeCounterState(sourceCounter));
	});

	const sourceGroupsByName = new Map(source.counterGroups.map(group => [group.name, group]));
	nextAdjusted.counterGroups = nextAdjusted.counterGroups.map(group => {
		const sourceGroup = sourceGroupsByName.get(group.name);
		if (!sourceGroup) return group;
		const sourceGroupCountersByName = new Map(
			sourceGroup.counters.map(counter => [counter.name, counter])
		);
		return {
			...group,
			counters: group.counters.map(counter => {
				const sourceCounter = sourceGroupCountersByName.get(counter.name);
				if (!sourceCounter || sourceCounter.style !== counter.style) return counter;
				return applyRuntimeCounterState(counter, getRuntimeCounterState(sourceCounter));
			}),
		};
	});

	return nextAdjusted;
}

export class SheetRecordModel extends Model<Database['sheetRecord']> {
	constructor(db: Kysely<Database>) {
		super(db);
	}

	public async create(args: NewSheetRecord): Promise<SheetRecord> {
		const adjustedSheet = args.adjustedSheet ?? args.sheet;
		const result = await this.db
			.insertInto('sheetRecord')
			.values({
				...args,
				conditions: args.conditions !== undefined ? sqlJSON(args.conditions) : undefined,
				adjustedSheet: sqlJSON(adjustedSheet),
			})
			.returning([
				'sheetRecord.id',
				'sheetRecord.sheet',
				'sheetRecord.adjustedSheet',
				'sheetRecord.conditions',
				'sheetRecord.trackerMode',
				'sheetRecord.trackerChannelId',
				'sheetRecord.trackerGuildId',
				'sheetRecord.trackerMessageId',
			])
			.executeTakeFirstOrThrow();
		return result;
	}

	public async readFull({ id }: { id: SheetRecordId }): Promise<SheetRecord | null> {
		const result = await this.db
			.selectFrom('sheetRecord')
			.select([
				'sheetRecord.id',
				'sheetRecord.sheet',
				'sheetRecord.adjustedSheet',
				'sheetRecord.conditions',
				'sheetRecord.trackerMode',
				'sheetRecord.trackerChannelId',
				'sheetRecord.trackerGuildId',
				'sheetRecord.trackerMessageId',
			])
			.where('sheetRecord.id', '=', id)
			.execute();
		return result[0];
	}

	public async read({ id }: { id: SheetRecordId }): Promise<SheetRecordBase | null> {
		const result = await this.db
			.selectFrom('sheetRecord')
			.select([
				'sheetRecord.id',
				'sheetRecord.sheet',
				'sheetRecord.conditions',
				'sheetRecord.trackerMode',
				'sheetRecord.trackerChannelId',
				'sheetRecord.trackerGuildId',
				'sheetRecord.trackerMessageId',
			])
			.where('sheetRecord.id', '=', id)
			.execute();
		return (result[0] as SheetRecordBase) ?? null;
	}

	public async readAdjusted({ id }: { id: SheetRecordId }): Promise<SheetRecordBase | null> {
		const result = await this.db
			.selectFrom('sheetRecord')
			.select([
				'sheetRecord.id',
				'sheetRecord.conditions',
				'sheetRecord.trackerMode',
				'sheetRecord.trackerChannelId',
				'sheetRecord.trackerGuildId',
				'sheetRecord.trackerMessageId',
			])
			.select('sheetRecord.adjustedSheet as sheet')
			.where('sheetRecord.id', '=', id)
			.execute();
		return (result[0] as SheetRecordBase) ?? null;
	}

	public async update(
		{ id }: { id: SheetRecordId },
		args: SheetRecordUpdate
	): Promise<SheetRecordBase> {
		const result = await this.db
			.updateTable('sheetRecord')
			.set({
				...args,
				conditions: args.conditions !== undefined ? sqlJSON(args.conditions) : undefined,
				adjustedSheet:
					args.adjustedSheet !== undefined ? sqlJSON(args.adjustedSheet) : undefined,
			})
			.where('sheetRecord.id', '=', id)
			.returning([
				'sheetRecord.id',
				'sheetRecord.sheet',
				'sheetRecord.conditions',
				'sheetRecord.trackerMode',
				'sheetRecord.trackerChannelId',
				'sheetRecord.trackerGuildId',
				'sheetRecord.trackerMessageId',
			])
			.executeTakeFirstOrThrow();
		return result;
	}

	public async updateSheetAndMirrorAdjustedCurrentValues(
		{ id }: { id: SheetRecordId },
		{ sheet }: { sheet: Sheet }
	): Promise<SheetRecordBase> {
		const existing = await this.readFull({ id });
		if (!existing) throw new Error(`No sheet record found for id ${id}`);
		const adjustedSheet = mirrorRuntimeCounterState(sheet, existing.adjustedSheet);
		return this.update({ id }, { sheet, adjustedSheet });
	}

	public async delete({ id }: { id: SheetRecordId }): Promise<void> {
		const result = await this.db
			.deleteFrom('sheetRecord')
			.where('sheetRecord.id', '=', id)
			.execute();
		if (Number(result[0].numDeletedRows) == 0) throw new Error('No rows deleted');
	}

	public async deleteOrphaned() {
		const result = await this.db
			.deleteFrom('sheetRecord')
			.where(eb => {
				const characterExists = eb.exists(ebInner =>
					ebInner
						.selectFrom('character')
						.selectAll()
						.whereRef('character.sheetRecordId', '=', 'sheetRecord.id')
				);
				const minionExists = eb.exists(ebInner =>
					ebInner
						.selectFrom('minion')
						.selectAll()
						.whereRef('minion.sheetRecordId', '=', 'sheetRecord.id')
				);
				const initActorExists = eb.exists(ebInner =>
					ebInner
						.selectFrom('initiativeActor')
						.selectAll()
						.whereRef('initiativeActor.sheetRecordId', '=', 'sheetRecord.id')
				);

				return eb.not(eb.or([characterExists, minionExists, initActorExists]));
			})
			.execute();
		return result[0];
	}
}
