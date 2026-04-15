import { Config } from '@kobold/config';
import { Kobold, getDialect } from '@kobold/db';

const dialect = getDialect(Config.database.url);

export const kobold = new Kobold(dialect);
