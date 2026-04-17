import schedule from 'node-schedule';

import { Logger } from './logger.js';

export interface Job {
	name: string;
	log: boolean;
	schedule: string;
	runOnStart?: boolean;
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

			if (job.runOnStart) {
				Logger.info(`Running job '${job.name}' on start.`);
				job.run()
					.then(() => {
						if (job.log) {
							Logger.info(`Job '${job.name}' initial run completed.`);
						}
					})
					.catch(error => {
						Logger.error(
							`An error occurred during initial run of '${job.name}'.`,
							error
						);
					});
			}
		}
	}
}
