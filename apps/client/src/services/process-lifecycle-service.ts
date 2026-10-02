import { Logger } from './logger.js';

export type ProcessRole = 'manager' | 'shard' | 'command-registration';

export class ProcessLifecycleService {
	private static registered = false;

	public static register(role: ProcessRole): void {
		if (this.registered) return;
		this.registered = true;

		Logger.info(`Process lifecycle logging registered for ${role}.`, {
			event: 'process_lifecycle_registered',
			role,
			pid: process.pid,
		});

		process.on('unhandledRejection', reason => {
			void Logger.error('An unhandled promise rejection occurred.', {
				err: reason,
				event: 'process_unhandled_rejection',
				role,
				pid: process.pid,
			});
		});

		// Monitor without suppressing Node's default crash behavior.
		process.on('uncaughtExceptionMonitor', (error, origin) => {
			void Logger.error('An uncaught exception is terminating the process.', {
				err: error,
				event: 'process_uncaught_exception',
				origin,
				role,
				pid: process.pid,
				memory: process.memoryUsage(),
			});
		});

		for (const signal of ['SIGTERM', 'SIGINT'] as const) {
			process.once(signal, () => {
				Logger.warn(`Process received ${signal}.`, {
					event: 'process_signal',
					signal,
					role,
					pid: process.pid,
					memory: process.memoryUsage(),
				});

				// The once-listener has been removed, so re-sending preserves the
				// operating system's normal signal termination semantics.
				try {
					process.kill(process.pid, signal);
				} catch (error) {
					void Logger.error(`Failed to re-send ${signal}; exiting with code 1.`, error);
					process.exit(1);
				}
			});
		}

		process.on('exit', code => {
			Logger.info(`Process exiting with code ${code}.`, {
				event: 'process_exit',
				code,
				role,
				pid: process.pid,
			});
		});
	}
}
