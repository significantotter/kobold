/**
 * Base test setup utilities for command tests.
 *
 * These helpers provide common setup patterns and reduce boilerplate
 * in test files.
 *
 * ## Unit Tests vs Integration Tests
 *
 * - **Unit tests**: Use `createUnitTestHarness` with `mockKobold` - no database connection required
 * - **Integration tests**: Use `createTestHarness` with `vitestKobold` - requires database connection
 *
 * Most chat command tests should be unit tests since they mock the return values anyway.
 */
import { NethysDb } from '@kobold/nethys';
import type { Kobold } from '@kobold/db';
import { Command, InjectedServices } from '../commands/command.js';
import { CommandTestHarness } from './command-test-harness.js';
import { mockKobold, resetMockKobold, type MockKobold } from './mock-kobold.js';

/** Default mock for NethysDb - most tests don't need a real compendium */
export const mockNethysDb = {} as NethysDb;

/** Default test user ID */
export const TEST_USER_ID = '123456789012345678';

/** Default test guild ID */
export const TEST_GUILD_ID = '987654321098765432';

/** Default test channel ID */
export const TEST_CHANNEL_ID = '123456789012345679';

/**
 * Get the mock Kobold instance for unit testing.
 * Use this when you need to configure mock returns on the kobold model methods.
 *
 * @example
 * ```typescript
 * const kobold = getMockKobold();
 * kobold.game.create.mockResolvedValue(newGame);
 * kobold.game.readMany.mockResolvedValue([]);
 * ```
 */
export function getMockKobold(): MockKobold {
	return mockKobold;
}

/**
 * Default services for unit tests.
 * Uses mockKobold (no database connection) and a mock NethysDb.
 */
export function getUnitTestServices(): InjectedServices {
	return {
		kobold: mockKobold as unknown as Kobold,
		nethysCompendium: mockNethysDb,
	};
}

/**
 * Default services for integration tests.
 * Uses vitestKobold from @kobold/db/test-utils (requires database connection) and a mock NethysDb.
 *
 * @deprecated For most tests, use getUnitTestServices() instead.
 * Only use this for tests that truly need database integration.
 */
export async function getIntegrationTestServices(): Promise<InjectedServices> {
	// Lazy import to avoid database connection in unit tests
	const { vitestKobold } = await import('@kobold/db/test-utils');
	return {
		kobold: vitestKobold,
		nethysCompendium: mockNethysDb,
	};
}

// Legacy alias for backwards compatibility
export const getDefaultTestServices = getUnitTestServices;

/**
 * Creates a CommandTestHarness with default services.
 *
 * @param commands - Commands to register
 * @param services - Optional service overrides
 */
export function createTestHarness(
	commands: Command[],
	services?: Partial<InjectedServices>
): CommandTestHarness {
	return new CommandTestHarness({
		commands,
		services: {
			...getDefaultTestServices(),
			...services,
		} as InjectedServices,
	});
}

/**
 * Standard mocks that most command tests need.
 * Call this in your test file's top-level scope.
 *
 * @example
 * ```typescript
 * // At top of test file, after imports
 * setupStandardMocks();
 *
 * // Or with additional mocks
 * setupStandardMocks(['../../../services/pastebin/index.js']);
 * ```
 */
export function getStandardMockModules(): string[] {
	return [
		'../../../utils/kobold-service-utils/kobold-utils.js',
		'../../../utils/kobold-helpers/finder-helpers.js',
	];
}
