/**
 * Shared test utilities for game command tests.
 *
 * These utilities provide mock factories and helpers specific to game commands,
 * reducing duplication across test files.
 */
import type { GameWithRelations, CharacterWithRelations } from '@kobold/db';
import {
	createMockCharacter,
	createMockInitiative,
	TEST_USER_ID,
	TEST_GUILD_ID,
} from '../../../test-utils/index.js';

// Re-export createMockInitiative for backwards compatibility
export { createMockInitiative } from '../../../test-utils/index.js';

/**
 * Creates a mock game object for testing.
 *
 * @example
 * ```typescript
 * const game = createMockGame({ name: 'My Campaign', isActive: true });
 * const gameWithChars = createMockGame({ characters: [char1, char2] });
 * ```
 */
export function createMockGame(overrides: Partial<GameWithRelations> = {}): GameWithRelations {
	return {
		id: 1,
		name: 'Test Game',
		gmUserId: TEST_USER_ID,
		guildId: TEST_GUILD_ID,
		isActive: false,
		characters: [],
		createdAt: new Date(),
		lastUpdatedAt: new Date(),
		...overrides,
	};
}

/**
 * Creates a mock game with a specified number of characters.
 *
 * @example
 * ```typescript
 * const game = createMockGameWithCharacters(3);
 * // Creates game with characters named "Character 1", "Character 2", "Character 3"
 * ```
 */
export function createMockGameWithCharacters(
	count: number,
	gameOverrides: Partial<GameWithRelations> = {}
): GameWithRelations {
	const characters: CharacterWithRelations[] = [];
	for (let i = 1; i <= count; i++) {
		characters.push(
			createMockCharacter({
				characterOverrides: { name: `Character ${i}`, id: i },
			})
		);
	}
	return createMockGame({ characters, ...gameOverrides });
}

/**
 * Creates a party of mock characters with specific names.
 *
 * @example
 * ```typescript
 * const party = createMockParty(['Fighter', 'Wizard', 'Cleric']);
 * ```
 */
export function createMockParty(names: string[]): CharacterWithRelations[] {
	return names.map((name, index) =>
		createMockCharacter({
			characterOverrides: { name, id: index + 1 },
		})
	);
}

/**
 * Creates a mock game with named party members.
 *
 * @example
 * ```typescript
 * const game = createMockGameWithParty('Dragon Slayers', ['Aragorn', 'Legolas', 'Gimli']);
 * ```
 */
export function createMockGameWithParty(
	gameName: string,
	characterNames: string[],
	gameOverrides: Partial<GameWithRelations> = {}
): GameWithRelations {
	return createMockGame({
		name: gameName,
		characters: createMockParty(characterNames),
		...gameOverrides,
	});
}
