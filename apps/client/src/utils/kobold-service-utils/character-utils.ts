import { BaseInteraction, CacheType, CommandInteraction, Interaction } from 'discord.js';
import { Character, CharacterBasic, CharacterWithRelations, Kobold } from '@kobold/db';
import { StringUtils } from '@kobold/base-utils';
import type { KoboldUtils } from './kobold-utils.js';

export class CharacterUtils {
	private kobold: Kobold;
	constructor(private koboldUtils: KoboldUtils) {
		this.kobold = koboldUtils.kobold;
	}

	/**
	 * Finds owned characters by name with full relations (sheet, actions, modifiers, etc.).
	 * Use findOwnedCharacterByNameLite when you only need basic info (name, id).
	 */
	public async findOwnedCharacterByName(
		nameText: string,
		userId: string
	): Promise<CharacterWithRelations[]> {
		const results = await this.kobold.character.readMany({ userId, name: nameText });
		const closestByName = StringUtils.generateSorterByWordDistance<Character>(
			nameText,
			character => character.name
		);
		return results.sort(closestByName);
	}

	/**
	 * Finds owned characters by name without loading relations.
	 * Use when you only need basic character info (name, id, sheetRecordId).
	 */
	public async findOwnedCharacterByNameLite(
		nameText: string,
		userId: string
	): Promise<CharacterBasic[]> {
		const results = await this.kobold.character.readManyLite({ userId, name: nameText });
		const closestByName = StringUtils.generateSorterByWordDistance<CharacterBasic>(
			nameText,
			character => character.name
		);
		return results.sort(closestByName);
	}

	/**
	 * Gets the active character for a user
	 * @param userId the discord use
	 * @returns the active character for the user, or null if one is not present
	 */
	public async getActiveCharacter(
		intr: BaseInteraction<CacheType>
	): Promise<CharacterWithRelations | null> {
		const { user, guildId, channelId } = intr;
		const userId = user.id;
		return this.kobold.character.readActive({
			userId,
			guildId: guildId ?? undefined,
			channelId: channelId ?? undefined,
		});
	}
}
