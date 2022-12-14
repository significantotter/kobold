/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * A record of a character set as the default for a user in a guild
 */
export interface GuildDefaultCharacter {
	/**
	 * The discord id of the guild for the default character.
	 */
	guildId?: string;
	/**
	 * The internal id of the character.
	 */
	characterId?: number;
	/**
	 * The discord id of the user who imported the character
	 */
	userId?: string;
	[k: string]: any;
}
