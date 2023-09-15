/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * A group of characters led by a GM, allowing the GM access to character rolls.
 */
export interface Game {
	/**
	 * The id of the game.
	 */
	id?: number;
	/**
	 * The discord id of the GM of the game.
	 */
	gmUserId?: string;
	/**
	 * The name of the game.
	 */
	name?: string;
	/**
	 * Whether the game is the gm's active game on the server
	 */
	isActive?: boolean;
	/**
	 * The discord guild id of the game.
	 */
	guildId?: string;
	/**
	 * When the initiative was first started
	 */
	createdAt?: string;
	/**
	 * When the initiative was last interacted with
	 */
	lastUpdatedAt?: string;
	[k: string]: any;
}
