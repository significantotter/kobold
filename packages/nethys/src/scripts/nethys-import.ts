import { Config } from '@kobold/config';
import { NethysLoader } from '../nethys-loader.js';

const gameSystem = process.env.GAME_SYSTEM ?? 'pf2e';
const indexName = gameSystem === 'sf2e' ? 'aonsf' : 'aon';
console.info(`Importing ${gameSystem} data from index "${indexName}"...`);
const loader = new NethysLoader({ gameSystem, indexName, databaseUrl: Config.database.url });
await loader.load();
await loader.close();
