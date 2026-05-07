import { AsyncLocalStorage } from 'node:async_hooks';

export interface CommandTimingMetadata {
	commandName: string;
	interactionId: string;
}

interface SlowQueryTiming {
	durationMs: number;
	sql: string;
}

interface CommandTimingStore extends CommandTimingMetadata {
	dbDurationMs: number;
	dbQueryCount: number;
	slowestQuery: SlowQueryTiming | null;
}

export interface CommandTimingSnapshot {
	dbDurationMs: number;
	dbQueryCount: number;
	slowestQuery: SlowQueryTiming | null;
}

const commandTimingStorage = new AsyncLocalStorage<CommandTimingStore | undefined>();

export class CommandTimingContext {
	public static async run<T>(
		metadata: CommandTimingMetadata,
		fn: () => Promise<T>
	): Promise<T> {
		return commandTimingStorage.run(
			{
				...metadata,
				dbDurationMs: 0,
				dbQueryCount: 0,
				slowestQuery: null,
			},
			fn
		);
	}

	public static recordDbQuery(durationMs: number, sql: string): void {
		const context = commandTimingStorage.getStore();
		if (!context) return;

		context.dbDurationMs += durationMs;
		context.dbQueryCount += 1;
		if (!context.slowestQuery || durationMs > context.slowestQuery.durationMs) {
			context.slowestQuery = { durationMs, sql };
		}
	}

	public static snapshot(): CommandTimingSnapshot {
		const context = commandTimingStorage.getStore();
		return {
			dbDurationMs: context?.dbDurationMs ?? 0,
			dbQueryCount: context?.dbQueryCount ?? 0,
			slowestQuery: context?.slowestQuery ?? null,
		};
	}

	public static async runOutside<T>(fn: () => Promise<T>): Promise<T> {
		return commandTimingStorage.run(undefined, fn);
	}
}
