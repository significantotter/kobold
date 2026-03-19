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

/** Type for mock Modifier model with additional methods */
interface MockModifierModel extends MockModel {
	deleteBySheetRecordId: MockFn;
	readManyByUser: MockFn;
	readManyUserWide: MockFn;
}

/** Type for mock RollMacro model with additional methods */
interface MockRollMacroModel extends MockModel {
	deleteBySheetRecordId: MockFn;
	readManyByUser: MockFn;
	readManyUserWide: MockFn;
}

/** Type for mock Action model with additional methods */
interface MockActionModel extends MockModel {
	deleteBySheetRecordId: MockFn;
	readManyByUser: MockFn;
	readManyUserWide: MockFn;
}

/** Type for mock Minion model with additional methods */
interface MockMinionModel extends MockModel {
	readManyByCharacterIds: MockFn;
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
 * Creates a mock Modifier model with additional modifier-specific methods.
 */
function createMockModifierModel(): MockModifierModel {
	return {
		...createMockModel(),
		deleteBySheetRecordId: vi.fn(),
		readManyByUser: vi.fn(),
		readManyUserWide: vi.fn(),
	};
}

/**
 * Creates a mock RollMacro model with additional roll-macro-specific methods.
 */
function createMockRollMacroModel(): MockRollMacroModel {
	return {
		...createMockModel(),
		deleteBySheetRecordId: vi.fn(),
		readManyByUser: vi.fn(),
		readManyUserWide: vi.fn(),
	};
}

/**
 * Creates a mock Action model with additional action-specific methods.
 */
function createMockActionModel(): MockActionModel {
	return {
		...createMockModel(),
		deleteBySheetRecordId: vi.fn(),
		readManyByUser: vi.fn(),
		readManyUserWide: vi.fn(),
	};
}

/**
 * Creates a mock Minion model with additional minion-specific methods.
 */
function createMockMinionModel(): MockMinionModel {
	return {
		...createMockModel(),
		readManyByCharacterIds: vi.fn(),
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
		action: createMockActionModel(),
		channelDefaultCharacter: createMockModel(),
		character: createMockCharacterModel(),
		game: createMockModel(),
		guildDefaultCharacter: createMockModel(),
		initiative: createMockInitiativeModel(),
		initiativeActor: createMockModel(),
		initiativeActorGroup: createMockModel(),
		minion: createMockMinionModel(),
		modifier: createMockModifierModel(),
		rollMacro: createMockRollMacroModel(),
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
	action: MockActionModel;
	channelDefaultCharacter: MockModel;
	character: MockCharacterModel;
	game: MockModel;
	guildDefaultCharacter: MockModel;
	initiative: MockInitiativeModel;
	initiativeActor: MockModel;
	initiativeActorGroup: MockModel;
	minion: MockMinionModel;
	modifier: MockModifierModel;
	rollMacro: MockRollMacroModel;
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
