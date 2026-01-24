/**
 * Mock Kobold instance for unit testing.
 *
 * This provides a fully mocked Kobold object that doesn't require any database connection.
 * All model methods are pre-stubbed and can be configured with mockResolvedValue/mockReturnValue.
 *
 * Use this instead of vitestKobold when you want true unit tests that run in parallel.
 */
import { vi, type Mock } from 'vitest';
import type { Kobold } from '@kobold/db';

// Type alias for a mock function to avoid referencing internal vitest/spy types
type MockFn = Mock;

/** Type for a mock model with common CRUD methods */
interface MockModel {
	create: MockFn;
	read: MockFn;
	readMany: MockFn;
	readByQuery: MockFn;
	update: MockFn;
	updateMany: MockFn;
	delete: MockFn;
	deleteMany: MockFn;
	deleteIfExists: MockFn;
	upsert: MockFn;
}

/** Type for mock Character model with additional methods */
interface MockCharacterModel extends MockModel {
	setIsActive: MockFn;
	readActive: MockFn;
}

/** Type for mock Initiative model with additional methods */
interface MockInitiativeModel extends MockModel {
	readActive: MockFn;
}

/**
 * Creates a mock model with all common CRUD methods stubbed.
 * Each method is a vi.fn() that can be configured with mockResolvedValue.
 */
function createMockModel(): MockModel {
	return {
		create: vi.fn(),
		read: vi.fn(),
		readMany: vi.fn(),
		readByQuery: vi.fn(),
		update: vi.fn(),
		updateMany: vi.fn(),
		delete: vi.fn(),
		deleteMany: vi.fn(),
		deleteIfExists: vi.fn(),
		upsert: vi.fn(),
	};
}

/**
 * Creates a mock Character model with additional character-specific methods.
 */
function createMockCharacterModel(): MockCharacterModel {
	return {
		...createMockModel(),
		setIsActive: vi.fn(),
		readActive: vi.fn(),
	};
}

/**
 * Creates a mock Initiative model with additional initiative-specific methods.
 */
function createMockInitiativeModel(): MockInitiativeModel {
	return {
		...createMockModel(),
		readActive: vi.fn(),
	};
}

/**
 * Creates a complete mock Kobold instance.
 * All model methods are stubbed and ready for mocking.
 *
 * @example
 * ```typescript
 * const kobold = createMockKobold();
 * kobold.game.create.mockResolvedValue({ id: 1, name: 'Test' });
 * ```
 */
export function createMockKobold() {
	return {
		db: {} as any,
		channelDefaultCharacter: createMockModel(),
		character: createMockCharacterModel(),
		game: createMockModel(),
		guildDefaultCharacter: createMockModel(),
		initiative: createMockInitiativeModel(),
		initiativeActor: createMockModel(),
		initiativeActorGroup: createMockModel(),
		sheetRecord: createMockModel(),
		userSettings: createMockModel(),
		wgAuthToken: createMockModel(),
	} as unknown as MockKobold;
}

/**
 * Type for a mocked Kobold instance where all methods are vi.fn().
 * This allows TypeScript to understand the mock methods.
 */
export type MockKobold = {
	db: any;
	channelDefaultCharacter: MockModel;
	character: MockCharacterModel;
	game: MockModel;
	guildDefaultCharacter: MockModel;
	initiative: MockInitiativeModel;
	initiativeActor: MockModel;
	initiativeActorGroup: MockModel;
	sheetRecord: MockModel;
	userSettings: MockModel;
	wgAuthToken: MockModel;
};

/**
 * Resets all mocks on a MockKobold instance.
 * Call this in beforeEach to ensure clean state.
 */
export function resetMockKobold(kobold: MockKobold): void {
	Object.values(kobold).forEach(model => {
		if (model && typeof model === 'object') {
			Object.values(model).forEach(method => {
				if (typeof method === 'function' && 'mockReset' in method) {
					(method as MockFn).mockReset();
				}
			});
		}
	});
}

/**
 * Default mock Kobold instance for tests.
 * This is created once and can be reset between tests.
 */
export const mockKobold = createMockKobold();
