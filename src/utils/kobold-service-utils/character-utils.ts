import _ from 'lodash';
import { StringUtils } from '../string-utils.js';
import { AutocompleteInteraction, CacheType, CommandInteraction } from 'discord.js';
import { Character, CharacterWithRelations } from '../../services/kobold/index.js';
import type { KoboldUtils } from './kobold-utils.js';
import { Kobold } from '../../services/kobold/index.js';

export class CharacterUtils {
	private kobold: Kobold;
	constructor(private koboldUtils: KoboldUtils) {
		this.kobold = koboldUtils.kobold;
	}

	/**
	 * Given a string, finds all skills containing that string on a given character
	 * @param targetCharacter the character to check for matching skills
	 * @param skillText the text to match to skills
	 * @returns all skills that contain the given skillText
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
	 * Gets the active character for a user
	 * @param userId the discord use
	 * @returns the active character for the user, or null if one is not present
	 */
	public async getActiveCharacter(
		intr: CommandInteraction | AutocompleteInteraction<CacheType>
	): Promise<CharacterWithRelations | null> {
		const { user, guildId, channelId } = intr;
		const userId = user.id;
		return this.kobold.character.readActive({
			userId,
			guildId: guildId ?? undefined,
			channelId,
		});
	}
}
