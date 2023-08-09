import schedule from 'node-schedule';

import { Job } from '../jobs/index.js';
import { Logger } from './index.js';
import Logs from './../config/lang/logs.json' assert { type: 'json' };

export class JobService {
	constructor(private jobs: Job[]) {}

	public start(): void {
		for (let job of this.jobs) {
			schedule.scheduleJob(job.schedule, async () => {
				try {
					if (job.log) {
						Logger.info(Logs.info.jobRun.replaceAll('{JOB}', job.name));
					}

					await job.run();

					if (job.log) {
						Logger.info(Logs.info.jobCompleted.replaceAll('{JOB}', job.name));
					}
				} catch (error) {
					Logger.error(Logs.error.job.replaceAll('{JOB}', job.name), error);
				}
			});
			Logger.info(
				Logs.info.jobScheduled
					.replaceAll('{JOB}', job.name)
					.replaceAll('{SCHEDULE}', job.schedule)
			);
		}
	}
}
