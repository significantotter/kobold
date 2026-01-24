/**
 * Shared test utilities for init command tests.
 *
 * These utilities provide mock factories and helpers specific to initiative commands,
 * reducing duplication across test files.
 *
 * NOTE: The core initiative mock functions have been moved to the shared test-utils.
 * This file re-exports them for backwards compatibility.
 */
export {
	createMockInitiative,
	createMockSheetRecord,
	createMockActorGroup,
	createMockInitiativeActor,
	createMockInitiativeWithActors,
	resetInitTestIds,
} from '../../../test-utils/index.js';
