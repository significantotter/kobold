import { Config } from '@kobold/config';
import { NethysLoader } from '@kobold/nethys';
import { Job } from '../services/job-service.js';
import { Logger } from '../services/index.js';

export class NethysImportJob implements Job {
	public name = 'Nethys Import';
	public schedule: string = Config.jobs.nethysImport.schedule;
	public log: boolean = Config.jobs.nethysImport.log;
	public runOnStart: boolean = Config.jobs.nethysImport.runOnStart;

	private logger = {
		info: (message: string) => Logger.info(message),
		error: (message: string, error?: unknown) => Logger.error(message, error),
	};

	public async run(): Promise<void> {
		for (const { gameSystem, indexName } of [
			{ gameSystem: 'pf2e', indexName: 'aon' },
			{ gameSystem: 'sf2e', indexName: 'aonsf' },
		]) {
			Logger.info(`Starting ${gameSystem} nethys import from index "${indexName}".`);
			const loader = new NethysLoader({
				gameSystem,
				indexName,
				logger: this.logger,
				databaseUrl: Config.database.url,
			});
			try {
				await loader.load();
				Logger.info(`Completed ${gameSystem} nethys import.`);
			} finally {
				await loader.close();
			}
		}
	}
}
