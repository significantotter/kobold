/**
 * Shared mock interfaces for test files.
 *
 * These interfaces provide proper typing for vi.fn() mockImplementation patterns,
 * eliminating the need for `this: any` in test files.
 */
import { vi } from 'vitest';

// Type alias for mock function to avoid internal vitest type references
type MockFn = ReturnType<typeof vi.fn>;

/**
 * Mock interface for KoboldEmbed builder pattern methods.
 * Use with vi.mocked(KoboldEmbed).mockImplementation
 */
export interface MockKoboldEmbed {
	setCharacter: MockFn;
	setTitle: MockFn;
	setDescription: MockFn;
	setFields: MockFn;
	addFields: MockFn;
	sendBatches: MockFn;
	setSheetRecord: MockFn;
	setThumbnail: MockFn;
	setColor: MockFn;
}

/**
 * Mock interface for RollBuilder methods.
 * Use with vi.mocked(RollBuilder).mockImplementation
 */
export interface MockRollBuilder {
	addRoll: MockFn;
	rollDice: MockFn;
	compileEmbed: MockFn;
}

/**
 * Mock interface for Creature methods.
 * Use with vi.mocked(Creature).mockImplementation
 */
export interface MockCreature {
	sheet: unknown;
	compendiumEntry: MockFn;
}

/**
 * Mock interface for KoboldUtils methods.
 * Use with vi.mocked(KoboldUtils).mockImplementation
 */
export interface MockKoboldUtils {
	fetchNonNullableDataForCommand: MockFn;
	assertActiveCharacterNotNull: MockFn;
	kobold: unknown;
	intr: unknown;
	activeCharacter: unknown;
}

/**
 * Mock interface for ActionRoller methods.
 * Use with vi.mocked(ActionRoller).mockImplementation
 */
export interface MockActionRoller {
	buildSheet: MockFn;
	rollAction: MockFn;
	addFields: MockFn;
}

/**
 * Mock interface for NethysParser methods.
 * Use with vi.mocked(NethysParser).mockImplementation
 */
export interface MockNethysParser {
	parseCompendiumEntry: MockFn;
}

/**
 * Mock interface for PasteBin methods.
 * Use with vi.mocked(PasteBin).mockImplementation
 */
export interface MockPasteBin {
	get: MockFn;
	create: MockFn;
}

/**
 * Mock interface for PathBuilder methods.
 * Use with vi.mocked(PathBuilder).mockImplementation
 */
export interface MockPathBuilder {
	fetchRaw: MockFn;
	fetchPf2eSheet: MockFn;
}

/**
 * Mock interface for character fetcher methods.
 * Use with vi.mocked(PathbuilderCharacterFetcher).mockImplementation
 * or vi.mocked(WgCharacterFetcher).mockImplementation
 * or vi.mocked(PasteBinCharacterFetcher).mockImplementation
 */
export interface MockCharacterFetcher {
	create: MockFn;
	update: MockFn;
}
