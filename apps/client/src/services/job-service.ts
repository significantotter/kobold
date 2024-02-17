import schedule from 'node-schedule';

import { Logger } from './logger.js';

export interface Job {
	name: string;
	log: boolean;
	schedule: string;
	run(): Promise<void>;
}

export class JobService {
	constructor(protected jobs: Job[]) {}

	public start(): void {
		for (let job of this.jobs) {
			schedule.scheduleJob(job.schedule, async () => {
				try {
					if (job.log) {
						Logger.info(`Running job '${job.name}'`);
					}

					await job.run();

					if (job.log) {
						Logger.info(`Job '${job.name}' completed.`);
					}
				} catch (error) {
					Logger.error(`An error occurred while running the '${job.name}' job.`, error);
				}
			});
			Logger.info(`Scheduled job '${job.name}' for '${job.schedule}'.`);
		}
	}
}
