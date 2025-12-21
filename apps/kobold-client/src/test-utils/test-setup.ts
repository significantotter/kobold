/**
 * Base test setup utilities for command integration tests.
 *
 * These helpers provide common setup patterns and reduce boilerplate
 * in test files.
 */
import { vitestKobold } from '@kobold/db/test-utils';
import { NethysDb } from '@kobold/nethys';
import { Command, InjectedServices } from '../commands/command.js';
import { CommandTestHarness } from './command-test-harness.js';

/** Default mock for NethysDb - most tests don't need a real compendium */
export const mockNethysDb = {} as NethysDb;

/** Default test user ID */
export const TEST_USER_ID = '123456789012345678';

/** Default test guild ID */
export const TEST_GUILD_ID = '987654321098765432';

/** Default test channel ID */
export const TEST_CHANNEL_ID = '123456789012345679';

/**
 * Default services for command tests.
 * Uses vitestKobold from @kobold/db/test-utils and a mock NethysDb.
 */
export function getDefaultTestServices(): InjectedServices {
	return {
		kobold: vitestKobold,
		nethysCompendium: mockNethysDb,
	};
}

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
