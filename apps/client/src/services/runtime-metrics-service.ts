import { Client } from 'discord.js';
import { IntervalHistogram, monitorEventLoopDelay } from 'node:perf_hooks';

import { Logger } from './logger.js';

export class RuntimeMetricsService {
	private readonly eventLoopDelay: IntervalHistogram;
	private timer?: NodeJS.Timeout;

	constructor(
		private readonly client: Client,
		private readonly intervalSecs: number
	) {
		this.eventLoopDelay = monitorEventLoopDelay({ resolution: 20 });
	}

	public start(): void {
		if (this.timer || this.intervalSecs <= 0) return;

		this.eventLoopDelay.enable();
		this.logSnapshot();
		this.timer = setInterval(() => this.logSnapshot(), this.intervalSecs * 1_000);
		this.timer.unref();
	}

	public stop(): void {
		if (this.timer) clearInterval(this.timer);
		this.timer = undefined;
		this.eventLoopDelay.disable();
	}

	private nanosecondsToMilliseconds(value: number): number {
		if (!Number.isFinite(value)) return 0;
		return Math.round((value / 1_000_000) * 100) / 100;
	}

	private logSnapshot(): void {
		try {
			const memory = process.memoryUsage();
			let guildMembers = 0;
			let guildRoles = 0;

			for (const guild of this.client.guilds.cache.values()) {
				guildMembers += guild.members.cache.size;
				guildRoles += guild.roles.cache.size;
			}

			Logger.info('Shard runtime metrics.', {
				event: 'shard_runtime_metrics',
				shardIds: this.client.shard?.ids ?? [],
				uptimeSecs: Math.round(process.uptime()),
				memory: {
					rssBytes: memory.rss,
					heapTotalBytes: memory.heapTotal,
					heapUsedBytes: memory.heapUsed,
					externalBytes: memory.external,
					arrayBuffersBytes: memory.arrayBuffers,
				},
				cache: {
					guilds: this.client.guilds.cache.size,
					channels: this.client.channels.cache.size,
					users: this.client.users.cache.size,
					guildMembers,
					guildRoles,
				},
				eventLoopDelayMs: {
					mean: this.nanosecondsToMilliseconds(this.eventLoopDelay.mean),
					max: this.nanosecondsToMilliseconds(this.eventLoopDelay.max),
					p50: this.nanosecondsToMilliseconds(this.eventLoopDelay.percentile(50)),
					p95: this.nanosecondsToMilliseconds(this.eventLoopDelay.percentile(95)),
					p99: this.nanosecondsToMilliseconds(this.eventLoopDelay.percentile(99)),
				},
			});
			this.eventLoopDelay.reset();
		} catch (error) {
			void Logger.error('Failed to collect shard runtime metrics.', error);
		}
	}
}
