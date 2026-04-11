import { Config } from '@kobold/config';
import { Kobold, getDialect } from '@kobold/db';

// Shared DB instance for tests to use.
const dialect = getDialect(Config.database.url);
export const kobold = new Kobold(dialect);
