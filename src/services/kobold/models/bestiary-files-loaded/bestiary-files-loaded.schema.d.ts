/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * The bestiary files imported into the database
 */
export interface BestiaryFilesLoaded {
	/**
	 * The id of the character record.
	 */
	id: number;
	/**
	 * The name of the file that was imported
	 */
	fileName: string;
	/**
	 * The most recent hash of the file that was imported
	 */
	fileHash: string;
	/**
	 * When the character was first imported
	 */
	createdAt?: string;
	/**
	 * When the character was last updated
	 */
	lastUpdatedAt?: string;
	[k: string]: any;
}
