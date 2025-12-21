/**
 * Interaction strings for the gameplay command.
 */

import { sharedStrings } from '../../lib/strings/shared-strings.js';

export const gameplayStrings = {
	/** Shared strings (choiceRegistered, errors, etc.) */
	shared: sharedStrings,
} as const;

export type GameplayStrings = typeof gameplayStrings;
