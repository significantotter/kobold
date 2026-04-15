// Re-export everything from @kobold/schema so existing consumers keep working
export * from '@kobold/schema';
export * from '@kobold/schema/db';

// Node-specific exports that stay in @kobold/db
export * from './db-types.js';
export * from './lib/relations-schemas.js';
export type { Database } from './supabase.kysely.types.js';
