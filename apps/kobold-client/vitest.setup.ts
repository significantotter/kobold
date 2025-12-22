import 'reflect-metadata';
import { afterEach, vi } from 'vitest';
import { setFaker } from 'zod-schema-faker/v4';
import { faker } from '@faker-js/faker';

// Initialize zod-schema-faker with faker instance globally before any tests run
setFaker(faker);

/**
 * Global test cleanup to ensure proper test isolation.
 * This runs after every test to prevent mock state from leaking between tests.
 *
 * - vi.restoreAllMocks(): Restores all spied methods to their original implementations
 * - vi.clearAllMocks(): Clears all mock call history and implementations
 *
 * IMPORTANT: Individual test files should NOT add their own afterEach blocks
 * with vi.clearAllMocks(), vi.resetAllMocks(), or mockReset() calls.
 * This global cleanup handles all mock cleanup automatically.
 *
 * If a test file needs custom cleanup (e.g., resetting module-level state),
 * it should be done in a beforeEach block to set up fresh state for each test.
 */
afterEach(() => {
	vi.restoreAllMocks();
	vi.clearAllMocks();
});
